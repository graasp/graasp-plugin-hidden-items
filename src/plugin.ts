import { FastifyPluginAsync } from 'fastify';

import { Actor, Item } from '@graasp/sdk';
import { ItemTagService } from 'graasp-item-tags';

import { CannotGetHiddenItemError, isGraaspError } from './utils';

export interface GraaspHiddenOptions {
  hiddenTagId: string;
}

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
  // avoid using tasks in hooks
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

  runner.setTaskPostHookHandler<Item>(itemTaskManager.getGetTaskName(), async (item, actor) => {
    await isItemHidden(item, actor);
  });

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetOwnTaskName(),
    async (items, actor) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor);
            return item;
          } catch (err) {
            if (isGraaspError(err)) {
              return null;
            }
            throw err;
          }
        }),
      );

      // Remove all hidden items in-place because we can't return a value from the handler
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetSharedWithTaskName(),
    async (items, actor) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor);
            return item;
          } catch (err) {
            if (isGraaspError(err)) {
              return null;
            }
            throw err;
          }
        }),
      );

      // Remove all hidden items in-place because we can't return a value from the handler
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetChildrenTaskName(),
    async (items, actor) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor);
            return item;
          } catch (err) {
            if (isGraaspError(err)) {
              return null;
            }
            throw err;
          }
        }),
      );

      // Remove all hidden items in-place because we can't return a value from the handler
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );
};

export default plugin;
