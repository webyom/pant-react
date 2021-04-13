export type KeySelector<T = Record<string, any>> = (record: T, recordIndex: number) => string;

export type RecordKey<T> = T extends Record<string, any> ? keyof T : string | KeySelector<T>;

export const select = <T = Record<string, any>>(recordKey?: RecordKey<T>): KeySelector<T> => {
  if (typeof recordKey === 'function') {
    return recordKey as KeySelector<T>;
  }

  return (record: T, recordIndex: number) => {
    if (typeof recordKey === 'undefined') {
      return recordIndex + '';
    }
    const parts = (recordKey as string).split('.');
    let tmp: any = record;
    while (tmp && parts.length) {
      tmp = tmp[parts.shift()];
    }
    const t = typeof tmp;
    if (t === 'string') {
      return tmp;
    } else if (t === 'number') {
      return t + '';
    }
    return recordIndex + '';
  };
};
