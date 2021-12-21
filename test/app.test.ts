import { ItemTaskManager, ItemMembershipTaskManager, TaskRunner } from 'graasp-test';
import { GRAASP_ACTOR, HIDDEN_ITEM_TAG_ID, ITEM_FILE, ITEM_FOLDER, ERROR } from './constants';
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
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeTruthy();
              return true;
            });
          expect(await fn(item, actor, { log: undefined })).resolves;
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
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              return true;
            });
          expect(await fn(item, actor, { log: undefined })).resolves;
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
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              throw ERROR;
            });

          expect(fn(item, actor, { log: undefined })).rejects.toEqual(ERROR);
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
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeTruthy();
              return true;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
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

    it('Items with tag and admin should success', (done) => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              return true;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([ITEM_FOLDER, ITEM_FILE]);
          done();
        }
      });

      build({
        itemTaskManager,
        runner,
        itemMembershipTaskManager,
        options: { hiddenTagId: HIDDEN_ITEM_TAG_ID },
      });
    });

    it('Item with tag and less than admin should fail', async () => {
      const items = [ITEM_FOLDER, ITEM_FILE];
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetOwnTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              throw ERROR;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
          expect([]).toEqual(items);
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
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeTruthy();
              return true;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
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
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              return true;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
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
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetSharedWithTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              throw ERROR;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([]);
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
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeTruthy();
              return true;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
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
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              return true;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
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
      mockCreateGetOfItemTask([{ tagId: HIDDEN_ITEM_TAG_ID, itemPath: ITEM_FILE.path }]);
      mockCreateGetMemberItemMembershipTask({});

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === itemTaskManager.getGetChildrenTaskName()) {
          jest
            .spyOn(TaskRunner.prototype, 'runSingleSequence')
            .mockImplementation(async (tasks) => {
              tasks[1].getInput();
              expect(tasks[1].skip).toBeFalsy();
              throw ERROR;
            });
          expect(await fn(items, actor, { log: undefined })).resolves;
          expect(items).toEqual([]);
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
