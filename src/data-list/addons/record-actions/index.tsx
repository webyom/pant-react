import { Icon } from '../../../icon';
import { ActionSheetItem, actionSheet } from '../../../action-sheet';
import { i18n } from '../../../locale';
import { DataListRecordProps } from '../../data-list-record';
import { DataListAddon } from '../..';

type RecordActionItem<T = Record<string, any>> = ActionSheetItem & {
  action: (record: T) => void;
};

export type RecordActionsOptions = {
  actions: RecordActionItem[];
  cancelText?: string;
};

export function recordActions(options: RecordActionsOptions): DataListAddon {
  return {
    onInjectRecord: (render) => (props) => {
      return <DataListRecordActions dataListRecordProps={props} dataListRecordRender={render} {...options} />;
    },
  };
}

function DataListRecordActions({
  dataListRecordRender,
  dataListRecordProps,
  actions,
  cancelText,
}: RecordActionsOptions & {
  dataListRecordProps: DataListRecordProps;
  dataListRecordRender: (props: DataListRecordProps) => JSX.Element;
}) {
  return (
    <>
      {dataListRecordRender({
        ...dataListRecordProps,
      })}
      <RecordActions actions={actions} cancelText={cancelText} record={dataListRecordProps.record} />
    </>
  );
}

function RecordActions({ actions, record, cancelText }: RecordActionsOptions & { record: any }) {
  const showActions = () => {
    actionSheet({
      actions,
      cancelText: typeof cancelText === 'undefined' ? i18n().cancel : cancelText,
      onSelect: function ({ action }: RecordActionItem) {
        action(record);
      },
    });
  };

  return (
    <div className="pant-data-list__record__actions">
      <Icon name="ellipsis" onClick={showActions} />
    </div>
  );
}
