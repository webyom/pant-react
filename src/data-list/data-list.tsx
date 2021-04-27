import React from 'react';
import { createBEM } from '../utils/bem';
import { i18n } from '../locale';
import { useMiddleware } from './use-middleware';
import { DataListRecord, RowRenderOptions } from './data-list-record';
import { RecordKey, select } from './key-selector';
import { DataListAddon } from '.';
import './index.scss';

export type DataListColumn<T = Record<string, any>> = {
  key: string;
  header: React.ReactNode | ((column: DataListColumn<T>) => React.ReactNode);
  render?: (options: RowRenderOptions<T>) => React.ReactNode;
};

export type DataListProps<T = Record<string, any>> = {
  records: T[];
  recordKey?: RecordKey<T>;
  recordRender?: (record: T, recordIndex: number) => JSX.Element;
  expandButton?: JSX.Element;
  collapseButton?: JSX.Element;
  columns?: DataListColumn<T>[];
  addons?: DataListAddon[];
  topTip?: React.ReactNode;
};

type DataListState = Record<string, any>;

const bem = createBEM('pant-data-list');

export class DataList<T = Record<string, any>> extends React.PureComponent<DataListProps<T>, DataListState> {
  static defaultProps = {};

  constructor(props: DataListProps<T>) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    const addons = this.props.addons;
    const props = useMiddleware(addons, 'onInjectProps')(this.props as any);
    const renderDataList = useMiddleware(
      addons,
      'onInjectDataList',
    )(({ records }) => (
      <div className={bem('records')}>
        {props.topTip ? (
          <div className={bem('tips')}>{props.topTip}</div>
        ) : !records.length ? (
          <div className={bem('tips')}>{i18n().noData}</div>
        ) : null}
        {records.map((record, recordIndex) => (
          <DataListRecord
            key={select(props.recordKey)(record, recordIndex)}
            {...props}
            record={record}
            recordIndex={recordIndex}
          />
        ))}
      </div>
    ));

    return <div className={bem()}>{renderDataList(props)}</div>;
  }
}
