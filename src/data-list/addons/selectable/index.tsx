import { Icon } from '../../../icon';
import { createBEM } from '../../../utils/bem';
import { DataListRecordProps } from '../../data-list-record';
import { DataListAddon } from '../..';
import './index.scss';

export type SelectableOptions = Record<string, any>;

export function selectable(options: SelectableOptions = {}): DataListAddon {
  return {
    onInjectRecord: (render) => (props) => {
      return <DataListSelectable dataListRecordProps={props} dataListRecordRender={render} {...options} />;
    },
  };
}

function DataListSelectable({
  dataListRecordRender,
  dataListRecordProps,
}: SelectableOptions & {
  dataListRecordProps: DataListRecordProps;
  dataListRecordRender: (props: DataListRecordProps) => JSX.Element;
}) {
  return (
    <>
      <Selectable />
      {dataListRecordRender({
        ...dataListRecordProps,
      })}
    </>
  );
}

const bem = createBEM('pant-data-list__select');

function Selectable(props: SelectableOptions) {
  return (
    <div className={bem()}>
      <Icon name="passed" />
    </div>
  );
}
