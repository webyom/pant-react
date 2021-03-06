import { useContext } from 'react';
import { Button } from '../../../button';
import { ActionSheetItem, actionSheet } from '../../../action-sheet';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';
import { SelectableManager, SelectableContext } from '../selectable';
import './index.scss';

type BatchActionItem<T = Record<string, any>> = ActionSheetItem & {
  action: (selectable: SelectableManager<T>) => void;
};

export type BatchActionsOptions<T = Record<string, any>> = {
  render?: (selectable: SelectableManager<T>, showActions: () => void) => JSX.Element;
  getActions?: (selectable: SelectableManager<T>) => BatchActionItem<T>[];
  cancelText?: string;
};

export function batchActions(options: BatchActionsOptions): DataListAddon {
  return {
    onInjectToolbar: (render) => (props) => {
      return (
        <>
          {render(props)}
          <BatchActions {...options} />
        </>
      );
    },
  };
}

function BatchActions({ render, getActions, cancelText }: BatchActionsOptions) {
  const selectable = useContext(SelectableContext);

  const showActions = () => {
    if (!getActions) {
      return;
    }
    const actions = getActions(selectable);
    actionSheet({
      position: 'top',
      round: false,
      actions: actions.slice(1),
      cancelText: typeof cancelText === 'undefined' ? i18n().cancel : cancelText,
      onSelect({ action }: BatchActionItem) {
        action(selectable);
      },
    });
  };

  if (render) {
    return <div className="pant-data-list__batch-actions">{render(selectable, showActions)}</div>;
  }

  const actions = getActions(selectable);
  const firstAction = actions[0];
  const secondAction = actions[1];

  const performFirstAction = (): void => {
    firstAction.action(selectable);
  };

  const performSecondAction = (): void => {
    secondAction.action(selectable);
  };

  return (
    <div className="pant-data-list__batch-actions">
      {firstAction ? (
        <Button size="small" type="info" plain onClick={performFirstAction}>
          {firstAction.name}
        </Button>
      ) : null}
      {actions.length > 2 ? (
        <Button size="small" onClick={showActions}>
          More ...
        </Button>
      ) : secondAction ? (
        <Button size="small" onClick={performSecondAction}>
          {secondAction.name}
        </Button>
      ) : null}
    </div>
  );
}
