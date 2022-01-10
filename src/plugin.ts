import { FastifyLoggerInstance, FastifyPluginAsync } from 'fastify';
import { Actor, Item, Member, PermissionLevel } from 'graasp';
import { ItemTagTaskManager, ItemTagService } from 'graasp-item-tags';
import { isGraaspError } from './utils';

export interface GraaspHiddenOptions {
  hiddenTagId: string;
}

const plugin: FastifyPluginAsync<GraaspHiddenOptions> = async (fastify, options) => {
  const {
    items: { dbService: iS, taskManager: itemTaskManager },
    itemMemberships: { dbService: iMS, taskManager: membershipTaskManager },
    taskRunner: runner,
  } = fastify;

  const { hiddenTagId } = options;

  const iTS = new ItemTagService();
  const taskManager = new ItemTagTaskManager(iS, iMS, iTS, itemTaskManager);

  // Hide the item for all users that don't have at least admin permission over it
  const isItemHidden = async (item: Item, actor: Actor, log: FastifyLoggerInstance) => {
    const t1 = taskManager.createGetOfItemTask(actor as Member, item);
    const t2 = membershipTaskManager.createGetMemberItemMembershipTask(actor, {
      item,
      validatePermission: PermissionLevel.Admin,
    });
    t2.getInput = () => {
      t2.skip = !Boolean(t1.result.filter(({ tagId }) => tagId === hiddenTagId).length);
    };

    await runner.runSingleSequence([t1, t2], log);
  };

  runner.setTaskPostHookHandler<Item>(
    itemTaskManager.getGetTaskName(),
    async (item, actor, { log }) => {
      await isItemHidden(item, actor, log);
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetOwnTaskName(),
    async (items, actor, { log }) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor, log);
            return item;
          } catch (err) {
            if (isGraaspError(err)) {
              return null;
            }
            throw err;
          }
        }),
      );

      // Remve all hidden items in-place because we can't return a value from the handler
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetSharedWithTaskName(),
    async (items, actor, { log }) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor, log);
            return item;
          } catch (err) {
            if (isGraaspError(err)) {
              return null;
            }
            throw err;
          }
        }),
      );

      // Remve all hidden items in-place because we can't return a value from the handler
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetChildrenTaskName(),
    async (items, actor, { log }) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor, log);
            return item;
          } catch (err) {
            if (isGraaspError(err)) {
              return null;
            }
            throw err;
          }
        }),
      );

      // Remve all hidden items in-place because we can't return a value from the handler
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );
};

export default plugin;
