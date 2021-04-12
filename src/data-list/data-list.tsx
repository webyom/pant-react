import React from 'react';
import { List, ListRowProps } from 'react-virtualized'; /* eslint-disable-line */
import { createBEM } from '../utils/bem';
import { useMiddleware } from './use-middleware';
import { DataListRecord, RowRenderOptions } from './data-list-record';
import { DataListAddon } from '.';
import './index.scss';

export type DataListColumn<T = Record<string, any>> = {
  key: string;
  header: React.ReactNode | ((column: DataListColumn<T>) => React.ReactNode);
  render?: (options: RowRenderOptions<T>) => React.ReactNode;
};

export type DataListProps<T = Record<string, any>> = {
  columns: DataListColumn<T>[];
  records: T[];
  recordKey?: T extends Record<string, any> ? keyof T : string | ((record: T, recordIndex: number) => string);
  recordDisabled?: (record: T) => boolean;
  addons?: DataListAddon[];
};

type DataListState = Record<string, any>;

const bem = createBEM('pant-data-list');

export type DataListContentValue = {
  dataList?: DataList;
};

export const DataListContext = React.createContext<DataListContentValue>({});

export class DataList<T = Record<string, any>> extends React.PureComponent<DataListProps<T>, DataListState> {
  static defaultProps = {};

  private containerRef = React.createRef<HTMLDivElement>();
  private listRef = React.createRef<List>();

  constructor(props: DataListProps<T>) {
    super(props);
    this.state = {};
  }

  getSelectedRecords(): T[] {
    return [];
  }

  render(): JSX.Element {
    const addons = this.props.addons;
    const props = useMiddleware(addons, 'onInjectProps')(this.props as any);
    const renderDataList = useMiddleware(
      addons,
      'onInjectDataList',
    )(({ columns, records, recordDisabled }) => (
      <div className={bem('records')}>
        {records.map((record, recordIndex) => (
          <DataListRecord
            key={recordIndex}
            columns={columns}
            record={record}
            recordIndex={recordIndex}
            recordDisabled={recordDisabled}
            addons={addons}
          />
        ))}
      </div>
    ));

    return (
      <DataListContext.Provider value={{ dataList: this as any }}>
        <div ref={this.containerRef} className={bem()}>
          {renderDataList(props)}
        </div>
      </DataListContext.Provider>
    );
  }
}
