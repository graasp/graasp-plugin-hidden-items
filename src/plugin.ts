import { FastifyLoggerInstance, FastifyPluginAsync } from 'fastify';
import {
  Actor,
  Item,
  Member,
  PermissionLevel,
  UnknownExtra,
} from 'graasp';
import { ItemTagTaskManager, ItemTagService } from 'graasp-item-tags';

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
  const taskManager = new ItemTagTaskManager(iS, iMS, iTS);

  const isItemHidden = async (item: Item, actor: Actor, log: FastifyLoggerInstance) => {
    const t1 = taskManager.createGetOfItemTask(actor as Member, item.id);
    const tags = await runner.runSingle(t1, log);

    // item is hidden
    if (tags.filter(({ tagId }) => tagId === hiddenTagId).length > 0) {
      const t2 = membershipTaskManager.createGetMemberItemMembershipTask(actor, {
        item,
        validatePermission: 'admin' as PermissionLevel,
      });
      await runner.runSingle(t2, log);
    }
  };

  runner.setTaskPostHookHandler<Item>(
    itemTaskManager.getGetTaskName(),
    async (item, actor, { log }) => {
      await isItemHidden(item, actor, log);
    },
  );

  runner.setTaskPostHookHandler<Item[]>(itemTaskManager.getGetOwnTaskName(), async (items, actor, { log }) => {
    const filteredItems = await Promise.all(
      items.map(async (item) => {
        try {
          await isItemHidden(item, actor, log);
          return item;
        } catch (err) {
          return (null as unknown) as Item<UnknownExtra>;
        }
      }),
    );
    items.splice(0, items.length, ...filteredItems.filter(Boolean));
  },);

  runner.setTaskPostHookHandler<Item[]>(
    itemTaskManager.getGetSharedWithTaskName(),
    async (items, actor, { log }) => {
      const filteredItems = await Promise.all(
        items.map(async (item) => {
          try {
            await isItemHidden(item, actor, log);
            return item;
          } catch (err) {
            return (null as unknown) as Item<UnknownExtra>;
          }
        }),
      );
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
            return (null as unknown) as Item<UnknownExtra>;
          }
        }),
      );
      items.splice(0, items.length, ...filteredItems.filter(Boolean));
    },
  );
};

export default plugin;
