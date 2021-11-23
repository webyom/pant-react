import React from 'react';
import { Icon } from '../../../icon';
import { ActionSheetItem, actionSheet } from '../../../action-sheet';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';

type RecordActionItem<T = Record<string, any>> = ActionSheetItem & {
  action: (record: T, recordIndex: number) => void;
};

export type RecordActionsOptions<T = Record<string, any>> = {
  actions: RecordActionItem<T>[];
  actionIcon?: JSX.Element;
  cancelText?: string;
};

export function recordActions(options: RecordActionsOptions): DataListAddon {
  return {
    onInjectRecord: (render) => (props) => {
      return (
        <>
          {render(props)}
          <RecordActions record={props.record} recordIndex={props.recordIndex} {...options} />
        </>
      );
    },
  };
}

function RecordActions({
  actions,
  record,
  recordIndex,
  actionIcon,
  cancelText,
}: RecordActionsOptions & { record: any; recordIndex: number }) {
  const showActions = () => {
    actionSheet({
      round: false,
      actions,
      cancelText: typeof cancelText === 'undefined' ? i18n().cancel : cancelText,
      onSelect: function ({ action }: RecordActionItem) {
        action(record, recordIndex);
      },
    });
  };

  return (
    <div className="pant-data-list__record__actions">
      {(actionIcon && React.cloneElement(actionIcon, { onClick: showActions })) || (
        <Icon name="ellipsis" onClick={showActions} />
      )}
    </div>
  );
}
