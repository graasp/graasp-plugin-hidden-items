import { FastifyPluginAsync } from 'fastify';
import {
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

  runner.setTaskPostHookHandler<Item>(
    itemTaskManager.getGetTaskName(),
    async (item, actor, { log }) => {
      const t1 = taskManager.createGetOfItemTask(actor as Member, item.id);
      const tags = await runner.runSingle(t1, log);

      // item is hidden
      if (tags.filter(({ tagId }) => tagId === hiddenTagId).length > 0) {
        const t2 = membershipTaskManager.createGetMemberItemMembershipTask(actor, {
          item,
          validatePermission: PermissionLevel.Admin,
        });
        await runner.runSingle(t2, log);
      }
    },
  );

  runner.setTaskPostHookHandler<Item[]>(itemTaskManager.getGetOwnTaskName(), async (items, actor, { log }) => {
    const filteredItems = await Promise.all(
      items.map(async (item) => {
        try {
          const t1 = taskManager.createGetOfItemTask(actor as Member, item.id);
          const tags = await runner.runSingle(t1, log);

          // item is hidden
          if (tags.filter(({ tagId }) => tagId === hiddenTagId).length > 0) {
            const t2 = membershipTaskManager.createGetMemberItemMembershipTask(actor, {
              item,
              validatePermission: PermissionLevel.Admin,
            });
            await runner.runSingle(t2, log);
          }
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
            const t1 = taskManager.createGetOfItemTask(actor as Member, item.id);
            const tags = await runner.runSingle(t1, log);

            // item is hidden
            if (tags.filter(({ tagId }) => tagId === hiddenTagId).length > 0) {
              const t2 = membershipTaskManager.createGetMemberItemMembershipTask(actor, {
                item,
                validatePermission: PermissionLevel.Admin,
              });
              await runner.runSingle(t2, log);
            }
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
            const t1 = taskManager.createGetOfItemTask(actor as Member, item.id);
            const tags = await runner.runSingle(t1, log);

            // item is hidden
            if (tags.filter(({ tagId }) => tagId === hiddenTagId).length > 0) {
              const t2 = membershipTaskManager.createGetMemberItemMembershipTask(actor, {
                item,
                validatePermission: PermissionLevel.Admin,
              });
              await runner.runSingle(t2, log);
            }
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
