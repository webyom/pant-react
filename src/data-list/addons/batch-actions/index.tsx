import { useContext } from 'react';
import { Button } from '../../../button';
import { ActionSheetItem, actionSheet } from '../../../action-sheet';
import { i18n } from '../../../locale';
import { DataListProps } from '../../data-list';
import { DataListAddon, DataListContext } from '../..';

type BatchActionItem<T = Record<string, any>> = ActionSheetItem & {
  action: (records: T[]) => void;
};

export type BatchActionsOptions<T = Record<string, any>> = {
  getActions?: (records: T[]) => BatchActionItem<T>[];
  cancelText?: string;
};

export function batchActions(options: BatchActionsOptions): DataListAddon {
  return {
    onInjectToolbox: (render) => (props) => {
      return <DataListBatchActions dataListProps={props} dataListRender={render} {...options} />;
    },
  };
}

function DataListBatchActions({
  dataListRender,
  dataListProps,
  ...props
}: BatchActionsOptions & {
  dataListProps: DataListProps;
  dataListRender: (props: DataListProps) => JSX.Element;
}) {
  return (
    <>
      {dataListRender({
        ...dataListProps,
      })}
      <BatchActions {...props} />
    </>
  );
}

function BatchActions({ getActions, cancelText }: BatchActionsOptions) {
  const { dataList } = useContext(DataListContext);
  const records = dataList.getSelectedRecords();
  const actions = getActions(records);
  const mainAction = actions[0];
  const showActions = () => {
    actionSheet({
      actions: actions.slice(1),
      cancelText: typeof cancelText === 'undefined' ? i18n().cancel : cancelText,
      onSelect: function ({ action }: BatchActionItem) {
        action(records);
      },
    });
  };

  const action = (): void => {
    mainAction.action(records);
  };

  return (
    <div className="pant-data-list__batch-actions">
      {mainAction ? (
        <Button size="small" type="info" onClick={action}>
          {mainAction.name}
        </Button>
      ) : null}
      {actions.length > 1 ? (
        <Button size="small" onClick={showActions}>
          More ...
        </Button>
      ) : null}
    </div>
  );
}
