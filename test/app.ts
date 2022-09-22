import fastify from 'fastify';

import {
  DatabaseTransactionHandler,
  Item,
  ItemMembershipService,
  ItemMembershipTaskManager,
  TaskRunner,
} from '@graasp/sdk';
import { ItemTaskManager } from 'graasp-test';

import plugin, { GraaspHiddenOptions } from '../src/plugin';
import { GRAASP_ACTOR } from './constants';

const build = async ({
  runner,
  itemTaskManager,
  itemMembershipTaskManager,
  itemMembershipService,
  options,
}: {
  runner: TaskRunner<Item>;
  itemTaskManager: ItemTaskManager;
  itemMembershipTaskManager: ItemMembershipTaskManager;
  itemMembershipService: ItemMembershipService;
  options?: GraaspHiddenOptions;
}) => {
  const app = fastify();
  app.decorateRequest('member', GRAASP_ACTOR);

  app.decorate('taskRunner', runner);
  app.decorate('items', {
    taskManager: itemTaskManager,
  });
  app.decorate('itemMemberships', {
    taskManager: itemMembershipTaskManager,
    dbService: itemMembershipService,
  });
  app.decorate('db', {
    pool: {} as unknown as DatabaseTransactionHandler,
  });

  await app.register(plugin, options);

  return app;
};
export default build;
