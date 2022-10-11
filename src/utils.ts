import { StatusCodes } from 'http-status-codes';

import { ErrorFactory, GraaspError } from '@graasp/sdk';

const PLUGIN_NAME = 'graasp-plugin-hidden-items';

export const isGraaspError = (object: Error): object is GraaspError => {
  return 'origin' in object;
};

const GraaspHiddenItemError = ErrorFactory(PLUGIN_NAME);

export class CannotGetHiddenItemError extends GraaspHiddenItemError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GHIERR001',
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Cannot read hidden item',
      },
      data,
    );
  }
}
