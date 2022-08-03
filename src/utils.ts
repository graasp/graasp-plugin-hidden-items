import { GraaspError } from '@graasp/sdk';

export const isGraaspError = (object: Error): object is GraaspError => {
  return 'origin' in object;
};
