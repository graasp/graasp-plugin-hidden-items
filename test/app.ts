import fastify from 'fastify';

import { Item, ItemMembershipTaskManager, TaskRunner } from '@graasp/sdk';
import { ItemTaskManager } from 'graasp-test';

import plugin, { GraaspHiddenOptions } from '../src/plugin';
import { GRAASP_ACTOR } from './constants';

const build = async ({
  runner,
  itemTaskManager,
  itemMembershipTaskManager,
  options,
}: {
  runner: TaskRunner<Item>;
  itemTaskManager: ItemTaskManager;
  itemMembershipTaskManager: ItemMembershipTaskManager;
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
  });

  await app.register(plugin, options);

  return app;
};
export default build;
