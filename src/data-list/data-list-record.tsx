import React, { useState } from 'react';
import { Icon } from '../icon';
import { createBEM } from '../utils/bem';
import { i18n } from '../locale';
import { useMiddleware } from './use-middleware';
import { DataListColumn, DataListProps } from '.';

export type RowRenderOptions<T = Record<string, any>> = {
  record: T;
  recordIndex: number;
  column: DataListColumn<T>;
  columnIndex: number;
};

export type DataListRecordProps<T = Record<string, any>> = DataListProps<T> & {
  record: T;
  recordIndex: number;
};

const bem = createBEM('pant-data-list__record');

export const DataListRecord: React.FC<DataListRecordProps> = (props) => {
  const { addons } = props;
  const [collapsed, setCollapsed] = useState(true);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const defaultColumnRender = ({ record, column }: RowRenderOptions): JSX.Element => {
    return record[column.key];
  };

  const renderRecord = useMiddleware(
    addons,
    'onInjectRecord',
  )(({ columns, record, recordIndex }) => {
    const expandable = columns.length > 4;
    return (
      <div className={bem('fields-wrapper')}>
        <div className={bem('fields')}>
          {columns
            .map((column, columnIndex) => {
              if (expandable && collapsed && columnIndex >= 3) {
                return;
              }
              const columnRender = column.render || defaultColumnRender;
              return (
                <div key={column.key} className={bem('field')}>
                  <div className={bem('title')}>
                    {typeof column.header === 'function' ? column.header(column) : column.header}
                  </div>
                  <div className={bem('value')}>{columnRender({ record, recordIndex, column, columnIndex })}</div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>
        {expandable ? (
          <div className={bem('expand')} onClick={toggle}>
            <span>{collapsed ? i18n().expand : i18n().collapse}</span>
            <Icon name={collapsed ? 'arrow-down' : 'arrow-up'} />
          </div>
        ) : null}
      </div>
    );
  });

  return <div className={bem()}>{renderRecord(props)}</div>;
};
