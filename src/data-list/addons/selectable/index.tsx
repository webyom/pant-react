import React, { useContext } from 'react';
import { Icon } from '../../../icon';
import { createBEM } from '../../../utils/bem';
import { DataListRecordProps } from '../../data-list-record';
import { select } from '../../key-selector';
import { DataListAddon } from '../..';
import { SelectableManager } from './manager';
import './index.scss';

export { SelectableManager };

export type SelectableOptions = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const SelectableContext = React.createContext<SelectableManager>(null);

export function selectable(options: SelectableOptions): DataListAddon {
  return {
    onInjectRecord: (render) => (props) => {
      return <DataListSelectable dataListRecordProps={props} dataListRecordRender={render} {...options} />;
    },
    onInjectDataList: (render) => (props) => {
      return (
        <SelectableContext.Provider
          value={new SelectableManager(props.records, options.value, props.recordKey, options.onChange)}
        >
          {render(props)}
        </SelectableContext.Provider>
      );
    },
  };
}

function DataListSelectable({
  dataListRecordRender,
  dataListRecordProps,
  ...options
}: SelectableOptions & {
  dataListRecordProps: DataListRecordProps;
  dataListRecordRender: (props: DataListRecordProps) => JSX.Element;
}) {
  return (
    <>
      <Selectable {...dataListRecordProps} {...options} />
      {dataListRecordRender({
        ...dataListRecordProps,
      })}
    </>
  );
}

const bem = createBEM('pant-data-list__select');

function Selectable({ record, recordIndex, recordKey }: DataListRecordProps & SelectableOptions) {
  const manager = useContext(SelectableContext);
  const key = select(recordKey)(record, recordIndex);

  const toggle = () => manager.toggle(key);

  return (
    <div className={bem()}>
      <Icon name={manager.hasKey(key) ? 'passed' : 'circle'} onClick={toggle} />
    </div>
  );
}
