import React, { useRef } from 'react';
import clsx from 'clsx';
import { Button } from '../button';
import { Overlay } from '../overlay';
import { Transition } from '../transition';
import { addUnit, getIncrementalZIndex } from '../utils';
import { i18n } from '../locale';
import { createBEM } from '../utils/bem';
import { BORDER_TOP, BORDER_LEFT } from '../utils/constant';
import './index.scss';

export type DialogProps = {
  show?: boolean;
  lockScroll?: boolean;
  title?: string;
  className?: string;
  titleNode?: React.ReactNode;
  width?: number | string;
  zIndex?: number;
  html?: boolean;
  message?: string;
  messageNode?: React.ReactNode;
  messageAlign?: string;
  cancelButtonText?: string;
  cancelButtonColor?: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  cancelLoading?: boolean;
  confirmLoading?: boolean;
  transition?: string;
  overlay?: boolean;
  cancelOnClickOverlay?: boolean;
  onClosed?(): void;
  onOpened?(): void;
  onCancelClick?(event: React.MouseEvent): void;
  onConfirmClick?(event: React.MouseEvent): void;
};

const bem = createBEM('pant-dialog');

function genButtons(props: DialogProps): JSX.Element {
  const { showConfirmButton, showCancelButton } = props;
  const multiple = showConfirmButton && showCancelButton;

  if (!showConfirmButton && !showCancelButton) {
    return;
  }

  return (
    <div className={clsx(BORDER_TOP, bem('footer', { buttons: multiple }))}>
      {props.showCancelButton && (
        <Button
          size="large"
          className={bem('cancel')}
          loading={props.cancelLoading}
          text={props.cancelButtonText || i18n().cancel}
          style={{ color: props.cancelButtonColor }}
          onClick={props.onCancelClick}
        />
      )}
      {props.showConfirmButton && (
        <Button
          size="large"
          className={clsx(bem('confirm'), { [BORDER_LEFT]: multiple })}
          loading={props.confirmLoading}
          text={props.confirmButtonText || i18n().confirm}
          style={{ color: props.confirmButtonColor }}
          onClick={props.onConfirmClick}
        />
      )}
    </div>
  );
}

export const Dialog: React.FC<DialogProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>();
  const { show, zIndex, html, message, messageAlign } = props;
  const messageNode = props.messageNode;
  const title = props.titleNode || props.title;
  const zIndexRef = useRef<number>();
  if (!zIndexRef.current) {
    zIndexRef.current = zIndex || getIncrementalZIndex();
  }

  const Title = title && <div className={bem('header', { isolated: !message && !messageNode })}>{title}</div>;

  const messageClassName = bem('message', {
    'has-title': title,
    [messageAlign]: messageAlign,
  });
  const Content = (messageNode || message) && (
    <div className={bem('content')}>
      {messageNode ? (
        messageNode
      ) : html ? (
        <div dangerouslySetInnerHTML={{ __html: message }} className={messageClassName} />
      ) : (
        <div className={messageClassName}>{message}</div>
      )}
    </div>
  );

  return (
    <React.Fragment>
      {props.overlay ? (
        <Overlay
          show={show}
          zIndex={zIndexRef.current}
          lockScroll={props.lockScroll}
          onClick={props.cancelOnClickOverlay ? props.onCancelClick : null}
        />
      ) : null}
      <Transition
        customName={props.transition}
        stage={show ? 'enter' : 'leave'}
        onAfterEnter={show ? props.onOpened : null}
        onAfterLeave={show ? null : props.onClosed}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-labelledby={props.title || message}
          className={clsx(bem(), props.className)}
          style={{ width: addUnit(props.width), zIndex: zIndexRef.current }}
        >
          {Title}
          {Content}
          {genButtons(props)}
        </div>
      </Transition>
    </React.Fragment>
  );
};

Dialog.defaultProps = {
  transition: 'dialog-bounce',
  lockScroll: true,
  overlay: true,
  showConfirmButton: true,
  cancelOnClickOverlay: false,
};
