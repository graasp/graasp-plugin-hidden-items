import { FastifyPluginAsync } from 'fastify';

import { Actor, Item, spliceIntoChunks } from '@graasp/sdk';
import { ItemTagService } from 'graasp-item-tags';

import { CannotGetHiddenItemError, isGraaspError } from './utils';

export interface GraaspHiddenOptions {
  hiddenTagId: string;
}

const MAX_NB_TASKS_IN_PARALLEL = 5;

const plugin: FastifyPluginAsync<GraaspHiddenOptions> = async (fastify, options) => {
  const {
    items: { taskManager: itemTaskManager },
    itemMemberships: { dbService: iMS },
    taskRunner: runner,
    db,
  } = fastify;

  const { hiddenTagId } = options;

  const iTS = new ItemTagService();

  // Hide items for all users that don't have at least admin permission over it
  // in parallel of a maximum of MAX_NB_TASKS_IN_PARALLEL parallel queries
  // avoid using tasks in hooks
  // difficult to run one query for all items because hasTag and canAdmin don't have many-calls
  const isItemHidden = async (item: Item, actor: Actor) => {
    const isHidden = await iTS.hasTag(item, hiddenTagId, db.pool);
    let canAdmin = true;
    if (isHidden) {
      canAdmin = await iMS.canAdmin(actor.id, item, db.pool);
    }
    if (isHidden && !canAdmin) {
      throw new CannotGetHiddenItemError(item.id);
    }
  };

  const removeHiddenItems = async (items, actor) => {
    // chunk items to run at maximum MAX_NB_TASKS_IN_PARALLEL
    const chunkedItems = spliceIntoChunks<Item>(
      items,
      Math.ceil(items.length / MAX_NB_TASKS_IN_PARALLEL),
    );

    const filteredItems = (
      await Promise.all(
        chunkedItems.map(
          // sequentially remove hidden items from chunk
          async (chunkedItems) => {
            const result = [];
            for (const i of chunkedItems) {
              try {
                await isItemHidden(i, actor);
                result.push(i);
              } catch (err) {
                if (!isGraaspError(err)) {
                  throw err;
                }
              }
            }
            return result;
          },
        ),
      )
    ).flat();

    // replace items in-place because we can't return a value from the handler
    items.splice(0, items.length, ...filteredItems.filter(Boolean));
  };

  runner.setTaskPostHookHandler<Item>(itemTaskManager.getGetTaskName(), async (item, actor) => {
    await isItemHidden(item, actor);
  });

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetOwnTaskName(),
    async (items, actor) => {
      await removeHiddenItems(items, actor);
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetSharedWithTaskName(),
    async (items, actor) => {
      await removeHiddenItems(items, actor);
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetChildrenTaskName(),
    async (items, actor) => {
      await removeHiddenItems(items, actor);
    },
  );
};

export default plugin;
