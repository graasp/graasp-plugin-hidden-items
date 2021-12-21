import { GraaspError, Item, Member, UnknownExtra } from 'graasp';
import { ItemTag, ItemTagTaskManager } from 'graasp-item-tags';
import { GetItemsItemTagsTask } from 'graasp-item-tags/dist/tasks/get-items-item-tags-task';
import {
  Task as MockTask,
  ItemMembershipTaskManager as MockItemMembershipTaskManager,
} from 'graasp-test';

// using multiple mocks updates runSingleSequence multiple times
export class MockGraaspError implements GraaspError {
  name: string;
  code: string;
  statusCode?: number;
  message: string;
  data?: unknown;
  origin: string;

  constructor(
    { code, statusCode, message }: { code: string; statusCode: number; message: string },
    data?: unknown,
  ) {
    this.name = code;
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.origin = 'plugin';
    this.data = data;
  }
}

export const mockCreateGetOfItemTask = (data: Partial<ItemTag>[] | Error): jest.SpyInstance => {
  const mockCreateTask = jest
    .spyOn(ItemTagTaskManager.prototype, 'createGetOfItemTask')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .mockImplementation((_member: Member<UnknownExtra>, _itemId: string) => {
      const task = new MockTask(data);
      return task as unknown as GetItemsItemTagsTask;
    });
  return mockCreateTask;
};

export const mockCreateGetMemberItemMembershipTask = (
  data: Partial<Item> | Error,
): jest.SpyInstance => {
  const mockTask = jest
    .spyOn(MockItemMembershipTaskManager.prototype, 'createGetMemberItemMembershipTask')
    .mockImplementation(() => {
      return new MockTask(data);
    });
  return mockTask;
};
