import React from 'react';
import { createBEM } from '../utils/bem';
import { useMiddleware } from './use-middleware';
import { DataListColumn, DataListAddon } from '.';

export type RowRenderOptions<T = Record<string, any>> = {
  record: T;
  recordIndex: number;
  column: DataListColumn<T>;
  columnIndex: number;
};

export type DataListRecordProps<T = Record<string, any>> = {
  columns: DataListColumn<T>[];
  record: T;
  recordIndex: number;
  recordDisabled?: (record: T) => boolean;
  addons?: DataListAddon[];
};

type DataListRecordState = Record<string, any>;

const bem = createBEM('pant-data-list__record');

export class DataListRecord extends React.PureComponent<DataListRecordProps, DataListRecordState> {
  static defaultProps = {};

  constructor(props: DataListRecordProps) {
    super(props);
    this.state = {};
  }

  columnRender({ record, column }: RowRenderOptions): JSX.Element {
    return record[column.key];
  }

  render(): JSX.Element {
    const { addons } = this.props;
    const renderRecord = useMiddleware(
      addons,
      'onInjectRecord',
    )(({ columns, record, recordIndex }) => (
      <div className={bem('fields')}>
        {columns.map((column, columnIndex) => {
          const columnRender = column.render || this.columnRender;
          return (
            <div key={column.key} className={bem('field')}>
              <div className={bem('title')}>
                {typeof column.header === 'function' ? column.header(column) : column.header}
              </div>
              <div className={bem('value')}>{columnRender({ record, recordIndex, column, columnIndex })}</div>
            </div>
          );
        })}
      </div>
    ));

    return <div className={bem()}>{renderRecord(this.props)}</div>;
  }
}
