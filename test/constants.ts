import { v4 } from 'uuid';

import { Actor, Item } from '@graasp/sdk';

import { MockGraaspError } from './mocks';

export const HIDDEN_ITEM_TAG_ID = 'hiddenTagId';
export const ERROR = new MockGraaspError({
  code: 'GR000',
  statusCode: 500,
  message: 'Member cannot write item',
});

export const ITEM_FILE: Item = {
  id: v4(),
  description: '',
  path: 'some_path',
  name: 'item-file',
  type: 'file',
  extra: {
    file: {},
  },
  creator: 'creator-id',
  createdAt: 'somedata',
  updatedAt: 'somedata',
  settings: {
    isPinned: false,
    showChatBox: false,
  },
};

export const ITEM_FOLDER: Item = {
  id: v4(),
  description: '',
  path: 'some_folder_path',
  name: 'item-folder',
  type: 'folder',
  extra: {},
  creator: 'creator-id',
  createdAt: 'somedata',
  updatedAt: 'somedata',
  settings: {
    isPinned: false,
    showChatBox: false,
  },
};

export const GRAASP_ACTOR: Actor = {
  id: 'actorid',
};

export const ITEMS: Item[] = [
  ITEM_FOLDER,
  {
    id: v4(),
    description: '',
    path: 'some_folder_path_1',
    name: 'item-folder',
    type: 'folder',
    extra: {},
    creator: 'creator-id',
    createdAt: 'somedata',
    updatedAt: 'somedata',
    settings: {
      isPinned: false,
      showChatBox: false,
    },
  },
  {
    id: v4(),
    description: '',
    path: 'some_folder_path_2',
    name: 'item-folder',
    type: 'folder',
    extra: {},
    creator: 'creator-id',
    createdAt: 'somedata',
    updatedAt: 'somedata',
    settings: {
      isPinned: false,
      showChatBox: false,
    },
  },
];
