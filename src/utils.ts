import { GraaspError } from 'graasp';

export const isGraaspError = (object: Error): object is GraaspError => {
  return 'origin' in object;
};
