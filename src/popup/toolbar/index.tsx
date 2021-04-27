import React from 'react';
import clsx from 'clsx';
import { i18n } from '../../locale';
import { createBEM } from '../../utils/bem';
import './index.scss';

export type PopupToolbarProps = {
  className?: string;
  title?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

const bem = createBEM('pant-popup-toolbar');

export const PopupToolbar: React.FC<PopupToolbarProps> = (props) => {
  const { className, title, cancelButtonText, confirmButtonText, onCancel, onConfirm } = props;
  const onlyTitle = !onCancel && !onConfirm;
  return (
    <div className={clsx(bem({ title: onlyTitle }), className)}>
      {!onlyTitle ? (
        <button key="cancel" type="button" className={bem('cancel')} onClick={onCancel}>
          {cancelButtonText || i18n().cancel}
        </button>
      ) : null}
      <div key="title" className={clsx(bem('title'), 'pant-ellipsis')}>
        {title}
      </div>
      {!onlyTitle ? (
        <button key="confirm" type="button" className={bem('confirm')} onClick={onConfirm}>
          {confirmButtonText || i18n().confirm}
        </button>
      ) : null}
    </div>
  );
};
