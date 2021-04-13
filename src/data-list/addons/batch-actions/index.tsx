import { useContext } from 'react';
import { Button } from '../../../button';
import { ActionSheetItem, actionSheet } from '../../../action-sheet';
import { i18n } from '../../../locale';
import { DataList, DataListProps } from '../../data-list';
import { DataListAddon, DataListContext } from '../..';
import './index.scss';

type BatchActionItem<T = Record<string, any>> = ActionSheetItem & {
  action: (records: T[], dataList: DataList) => void;
};

export type BatchActionsOptions<T = Record<string, any>> = {
  getActions?: (records: T[]) => BatchActionItem<T>[];
  cancelText?: string;
};

export function batchActions(options: BatchActionsOptions): DataListAddon {
  return {
    onInjectToolbar: (render) => (props) => {
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
  const firstAction = actions[0];
  const secondAction = actions[1];

  const performFirstAction = (): void => {
    firstAction.action(records, dataList);
  };

  const performSecondAction = (): void => {
    secondAction.action(records, dataList);
  };

  const showActions = () => {
    actionSheet({
      actions: actions.slice(1),
      cancelText: typeof cancelText === 'undefined' ? i18n().cancel : cancelText,
      onSelect({ action }: BatchActionItem) {
        action(records, dataList);
      },
    });
  };

  return (
    <div className="pant-data-list__batch-actions">
      {firstAction ? (
        <Button size="small" type="info" onClick={performFirstAction}>
          {firstAction.name}
        </Button>
      ) : null}
      {actions.length > 2 ? (
        <Button size="small" onClick={showActions}>
          More ...
        </Button>
      ) : (
        <Button size="small" onClick={performSecondAction}>
          {secondAction.name}
        </Button>
      )}
    </div>
  );
}
