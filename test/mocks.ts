import { Item, Member, UnknownExtra } from 'graasp';
import { ItemTag, ItemTagTaskManager } from 'graasp-item-tags';
import { GetItemsItemTagsTask } from 'graasp-item-tags/dist/tasks/get-items-item-tags-task';
import {
  Task as MockTask,
  TaskRunner as MockTaskRunner,
  ItemMembershipTaskManager as MockItemMembershipTaskManager,
} from 'graasp-test';

// using multiple mocks updates runSingleSequence multiple times

export const mockCreateGetOfItemTask = (
  data: Partial<ItemTag>[] | Error,
  shouldThrow?: boolean,
): jest.SpyInstance => {
  const mockCreateTask = jest
    .spyOn(ItemTagTaskManager.prototype, 'createGetOfItemTask')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .mockImplementation((_member: Member<UnknownExtra>, _itemId: string) => {
      return new MockTask(data) as unknown as GetItemsItemTagsTask;
    });
  jest.spyOn(MockTaskRunner.prototype, 'runSingle').mockImplementation(async () => {
    if (shouldThrow) throw data;
    return data;
  });
  return mockCreateTask;
};

export const mockCreateGetMemberItemMembershipTask = (
  data: Partial<Item> | Error,
  shouldThrow?: boolean,
): jest.SpyInstance => {
  const mockTask = jest
    .spyOn(MockItemMembershipTaskManager.prototype, 'createGetMemberItemMembershipTask')
    .mockImplementation(() => {
      return new MockTask(data);
    });
  /*jest.spyOn(MockTaskRunner.prototype, 'runSingle').mockImplementation(async () => {
    if (shouldThrow) throw data;
    return data;
  });*/
  return mockTask;
};
