import { get } from 'lodash-es';

export type KeySelector<T = Record<string, any>> = (record: T, recordIndex: number) => string;

export type RecordKey<T> = T extends Record<string, any> ? keyof T : string | string[] | KeySelector<T>;

export const select = <T = Record<string, any>>(recordKey?: RecordKey<T>): KeySelector<T> => {
  if (typeof recordKey === 'function') {
    return recordKey as KeySelector<T>;
  }

  return (record: T, recordIndex: number) => {
    return get(record, recordKey as string | string[], recordIndex) + '';
  };
};
