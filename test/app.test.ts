import { FastifyLoggerInstance } from 'fastify';

import { ItemMembershipService } from '@graasp/sdk';
import { ItemTagService } from 'graasp-item-tags';
import { ItemMembershipTaskManager, ItemTaskManager, TaskRunner } from 'graasp-test';

import { CannotGetHiddenItemError } from '../src/utils';
import build from './app';
import { GRAASP_ACTOR, HIDDEN_ITEM_TAG_ID, ITEM_FILE, ITEM_FOLDER } from './constants';
import { mockCreateGetMemberItemMembershipTask, mockCreateGetOfItemTask } from './mocks';

const itemTaskManager = new ItemTaskManager();
const itemMembershipTaskManager = new ItemMembershipTaskManager();
const itemMembershipService = {
  canAdmin: jest.fn(),
} as unknown as ItemMembershipService;
const runner = new TaskRunner();
const actor = GRAASP_ACTOR;
const MOCK_LOGGER = {} as unknown as FastifyLoggerInstance;

const mockIsItemHiddenFn = ({ hasTag, canAdmin }) => {
  jest.spyOn(ItemTagService.prototype, 'hasTag').mockImplementation(async () => {
    return hasTag;
  });
  itemMembershipService.canAdmin = jest.fn().mockImplementation(async () => {
    return canAdmin;
  });
};

describe('test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async () => false);
    jest.spyOn(runner, 'setTaskPreHookHandler').mockImplementation(async () => false);
  });

  describe('getGetTaskName PostHook', () => {
    it('Item without tag should success', async () => {
      const item = ITEM_FILE;

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          mockIsItemHiddenFn({ hasTag: false, canAdmin: true });
          expect(await fn(item, actor, { log: MOCK_LOGGER })).resolves;
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and admin should success', async () => {
      const item = ITEM_FILE;
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: true });
          expect(await fn(item, actor, { log: MOCK_LOGGER })).resolves;
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const item = ITEM_FILE;
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: false });

          expect(fn(item, actor, { log: MOCK_LOGGER })).rejects.toEqual(
            new CannotGetHiddenItemError(ITEM_FILE.id),
          );
        }
      });

      await build({
        itemTaskManager,
        itemMembershipService,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });

  describe('getGetOwnTaskName setTaskPostHookHandler', () => {
    it('Items without tag should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          mockIsItemHiddenFn({ hasTag: false, canAdmin: true });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Items with tag and admin should success', (done) => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: true });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
          done();
        }
      });

      build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should return no item', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: false });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect([]).toEqual(items);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Empty items should continue', async () => {
      const items = [];
      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          mockIsItemHiddenFn({ hasTag: false, canAdmin: true });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });

  describe('getGetSharedWithTaskName postHook', () => {
    it('Items without tag should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          mockIsItemHiddenFn({ hasTag: false, canAdmin: false });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Items with tag and admin should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: true });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: false });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });

  describe('getGetChildrenTaskName PostHook', () => {
    it('Items without tag should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          mockIsItemHiddenFn({ hasTag: false, canAdmin: false });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Items with tag and admin should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: true });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          mockIsItemHiddenFn({ hasTag: true, canAdmin: false });
          expect(await fn(items, actor, { log: MOCK_LOGGER })).resolves;
          expect(items).toEqual([]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipService,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });
});
