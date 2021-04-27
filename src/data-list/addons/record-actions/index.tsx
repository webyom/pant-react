import React from 'react';
import { Icon } from '../../../icon';
import { ActionSheetItem, actionSheet } from '../../../action-sheet';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';

type RecordActionItem<T = Record<string, any>> = ActionSheetItem & {
  action: (record: T) => void;
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
          <RecordActions record={props.record} {...options} />
        </>
      );
    },
  };
}

function RecordActions({ actions, record, actionIcon, cancelText }: RecordActionsOptions & { record: any }) {
  const showActions = () => {
    actionSheet({
      round: false,
      actions,
      cancelText: typeof cancelText === 'undefined' ? i18n().cancel : cancelText,
      onSelect: function ({ action }: RecordActionItem) {
        action(record);
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
