import { DataListProps } from './data-list';
import { DataListRecordProps } from './data-list-record';

export * from './data-list';

export interface DataListAddon<T = Record<string, any>> {
  onInjectProps?: DataListMiddleware<DataListProps<T>>;
  onInjectDataList?: DataListMiddleware<(props: DataListProps<T>) => JSX.Element>;
  onInjectToolbar?: DataListMiddleware<(props: DataListProps<T>) => JSX.Element>;
  onInjectRecord?: DataListMiddleware<(props: DataListRecordProps<T>) => JSX.Element>;
}

export interface DataListMiddleware<T> {
  (next: T): T;
}
