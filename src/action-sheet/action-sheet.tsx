import React from 'react';
import clsx from 'clsx';
import { Popup, PopupProps } from '../popup';
import { Loading } from '../loading';
import { Icon } from '../icon';
import { createBEM } from '../utils/bem';
import { BORDER_TOP } from '../utils/constant';
import './index.scss';

export type ActionSheetItem = {
  name: string;
  value?: any;
  color?: string;
  subname?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export type ActionSheetProps = PopupProps & {
  title?: string;
  actions?: ActionSheetItem[];
  cancelText?: string;
  description?: string;
  onClosed?(): void;
  onOpened?(): void;
  onCancel?(event: React.MouseEvent): void;
  onSelect?(item: ActionSheetItem, index: number): void;
};

const bem = createBEM('pant-action-sheet');

export const ActionSheet: React.FC<ActionSheetProps> = (props) => {
  const { show, title, cancelText } = props;

  function Header(): JSX.Element {
    if (title) {
      return (
        <div className={bem('header')}>
          {title}
          <Icon name={props.closeIcon} className={bem('close')} onClick={props.onCancel} />
        </div>
      );
    }
  }

  function Content(): JSX.Element {
    if (props.children) {
      return <div className={bem('content')}>{props.children}</div>;
    }
  }

  function Option(item: ActionSheetItem, index: number): JSX.Element {
    const { disabled, loading } = item;

    function onClickOption(event: React.MouseEvent): void {
      event.stopPropagation();

      if (disabled || loading) {
        return;
      }

      props.onSelect && props.onSelect(item, index);
    }

    function OptionContent(): JSX.Element | JSX.Element[] {
      if (loading) {
        return <Loading size="20px" />;
      }

      return [
        <span key="name" className={bem('name')}>
          {item.name}
        </span>,
        item.subname && (
          <span key="subname" className={bem('subname')}>
            {item.subname}
          </span>
        ),
      ];
    }

    return (
      <button
        key={index}
        type="button"
        className={clsx(bem('item', { disabled, loading }), item.className, BORDER_TOP)}
        style={{ color: item.color }}
        onClick={onClickOption}
      >
        {OptionContent()}
      </button>
    );
  }

  function CancelText(): JSX.Element {
    if (cancelText) {
      return (
        <button type="button" className={bem('cancel')} onClick={props.onCancel}>
          {cancelText}
        </button>
      );
    }
  }

  const Description = props.description && <div className={bem('description')}>{props.description}</div>;

  return (
    <Popup
      className={bem()}
      show={show}
      position="bottom"
      zIndex={props.zIndex}
      round={props.round}
      overlay={props.overlay}
      duration={props.duration}
      lazyRender={props.lazyRender}
      closeOnClickOverlay={props.closeOnClickOverlay}
      safeAreaInsetBottom={props.safeAreaInsetBottom}
      onClickClose={props.onCancel}
      onOpened={show ? props.onOpened : null}
      onClosed={show ? null : props.onClosed}
    >
      {Header()}
      {Description}
      {props.actions && props.actions.map(Option)}
      {Content()}
      {CancelText()}
    </Popup>
  );
};

ActionSheet.defaultProps = {
  round: true,
  safeAreaInsetBottom: true,
  closeOnClickOverlay: true,
};
