import { ItemTaskManager, ItemMembershipTaskManager, TaskRunner } from 'graasp-test';
import { GRAASP_ACTOR, HIDDEN_ITEM_TAG_ID, ITEM_FILE, ITEM_FOLDER } from './constants';
import build from './app';
import { mockCreateGetMemberItemMembershipTask, mockCreateGetOfItemTask } from './mocks';

const itemTaskManager = new ItemTaskManager();
const itemMembershipTaskManager = new ItemMembershipTaskManager();
const runner = new TaskRunner();
const actor = GRAASP_ACTOR;

describe('test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async () => false);
    jest.spyOn(runner, 'setTaskPreHookHandler').mockImplementation(async () => false);
  });

  describe('getGetTaskName setTaskPostHookHandler', () => {
    it('Item without tag should success', async () => {
      const item = ITEM_FILE;

      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          expect(fn(item, actor, { log: undefined })).resolves;
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and admin should success', async () => {
      const item = ITEM_FILE;

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          expect(fn(item, actor, { log: undefined })).resolves;
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const item = ITEM_FILE;

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }], true);
      mockCreateGetMemberItemMembershipTask(new Error('Member cannot write item'), true);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          expect(fn(item, actor, { log: undefined })).rejects.toEqual(
            [{ tagId: HIDDEN_ITEM_TAG_ID }],
            //new Error('Member cannot write item'),
          );
        }
      });

      await build({
        itemTaskManager,
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
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          expect(fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Items with tag and admin should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          expect(fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }], true);
      mockCreateGetMemberItemMembershipTask(new Error('Member cannot write item'), true);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          const promise = fn(items, actor, { log: undefined });
          await promise;
          expect(promise).resolves;
          expect(items).toEqual([]);
          //new Error('Member cannot write item'),
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });

  describe('getGetSharedWithTaskName setTaskPostHookHandler', () => {
    it('Items without tag should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          expect(fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Items with tag and admin should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          expect(fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }], true);
      mockCreateGetMemberItemMembershipTask(new Error('Member cannot write item'), true);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          const promise = fn(items, actor, { log: undefined });
          await promise;
          expect(promise).resolves;
          expect(items).toEqual([]);
          // new Error('Member cannot write item'),
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });

  describe('getGetChildrenTaskName setTaskPostHookHandler', () => {
    it('Items without tag should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          expect(fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Items with tag and admin should success', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }]);
      mockCreateGetMemberItemMembershipTask(ITEM_FILE);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          expect(fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];

      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID }], true);
      mockCreateGetMemberItemMembershipTask(new Error('Member cannot write item'), true);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          const promise = fn(items, actor, { log: undefined });
          await promise;
          expect(promise).resolves;
          expect(items).toEqual([]);
          //new Error('Member cannot write item'),
        }
      });

      await build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });
  });
});
