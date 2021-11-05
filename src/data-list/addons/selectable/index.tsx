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
  checkedIcon?: JSX.Element;
  uncheckedIcon?: JSX.Element;
  singleCheckedIcon?: JSX.Element;
  singleUncheckedIcon?: JSX.Element;
  value?: string[];
  maxSelection?: number;
  maxSelectionMsg?: string;
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
          value={
            new SelectableManager(
              props.records,
              options.value,
              props.recordKey,
              options.maxSelection,
              options.maxSelectionMsg,
              options.onChange,
            )
          }
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

function Selectable({
  record,
  recordIndex,
  recordKey,
  maxSelection,
  checkedIcon,
  uncheckedIcon,
  singleCheckedIcon,
  singleUncheckedIcon,
}: DataListRecordProps & SelectableOptions) {
  const manager = useContext(SelectableContext);
  const key = select(recordKey)(record, recordIndex);

  const toggle = () => manager.toggle(key);

  let icon;
  if (manager.hasKey(key)) {
    icon =
      maxSelection === 1 && singleCheckedIcon
        ? React.cloneElement(singleCheckedIcon, { onClick: toggle })
        : (checkedIcon && React.cloneElement(checkedIcon, { onClick: toggle })) || (
            <Icon name="passed" onClick={toggle} />
          );
  } else {
    icon =
      maxSelection === 1 && singleUncheckedIcon
        ? React.cloneElement(singleUncheckedIcon, { onClick: toggle })
        : (uncheckedIcon && React.cloneElement(uncheckedIcon, { onClick: toggle })) || (
            <Icon name="circle" onClick={toggle} />
          );
  }

  return <div className={bem()}>{icon}</div>;
}
