import { DataListAddon, DataListMiddleware } from '.';

export function useMiddleware<K extends keyof DataListAddon>(addons: DataListAddon[], name: K) {
  type Value<T> = T extends DataListMiddleware<infer V> ? V : never;
  type ValueType = Value<DataListAddon[typeof name]>;

  if (!addons || !addons.length) {
    return (initialValue: ValueType) => initialValue;
  }

  return (initialValue: ValueType) =>
    addons
      .map((x) => x[name])
      .filter(Boolean)
      .reduce<ValueType>((previous, middleware: DataListMiddleware<any>) => middleware(previous), initialValue);
}
