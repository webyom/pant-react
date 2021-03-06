import React, { useRef } from 'react';
import clsx from 'clsx';
import { Overlay } from '../overlay';
import { Transition } from '../transition';
import { isDef, getIncrementalZIndex } from '../utils';
import { createBEM } from '../utils/bem';
import { Z_INDEX_TOAST_BASE } from '../utils/constant';
import { Icon } from '../icon';
import { Loading, LoadingType } from '../loading';
import './index.scss';

export type ToastPosition = 'top' | 'middle' | 'bottom';

export type ToastTextAlign = 'left' | 'center' | 'right';

export type ToastProps = {
  show?: boolean;
  zIndex?: number;
  message: string;
  icon?: string;
  html?: boolean;
  className?: string;
  overlay?: boolean;
  iconPrefix?: string;
  position?: ToastPosition;
  loading?: boolean;
  loadingType?: LoadingType;
  textAlign?: ToastTextAlign;
  onClosed?(): void;
  onOpened?(): void;
  onClick?(event: React.MouseEvent): void;
};

const bem = createBEM('pant-toast');

function genIcon(props: ToastProps): JSX.Element {
  const { icon, iconPrefix, loading, loadingType } = props;

  if (loading) {
    return <Loading className={bem('loading')} type={loadingType} />;
  } else if (icon) {
    return <Icon className={bem('icon')} classPrefix={iconPrefix} name={icon} />;
  }
}

function genMessage(props: ToastProps): JSX.Element {
  const { html, message } = props;

  if (!isDef(message) || message === '') {
    return;
  }

  if (html) {
    return <div className={bem('text')} dangerouslySetInnerHTML={{ __html: message }} />;
  }

  return <div className={bem('text')}>{message}</div>;
}

export const Toast: React.FC<ToastProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>();
  const { show, zIndex, overlay } = props;
  const incZIndex = zIndex || getIncrementalZIndex(Z_INDEX_TOAST_BASE);

  return (
    <React.Fragment>
      {overlay ? <Overlay zIndex={incZIndex} style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }} show={show} /> : null}
      <Transition
        name="fade"
        stage={show ? 'enter' : 'leave'}
        onAfterEnter={show ? props.onOpened : null}
        onAfterLeave={show ? null : props.onClosed}
      >
        <div
          ref={containerRef}
          className={clsx(
            bem([
              props.position,
              `align-${props.textAlign}`,
              { [props.html ? 'html' : 'text']: !props.icon && !props.loading },
            ]),
            props.className,
          )}
          style={{ zIndex: incZIndex }}
          onClick={props.onClick}
        >
          {genIcon(props)}
          {genMessage(props)}
        </div>
      </Transition>
    </React.Fragment>
  );
};

Toast.defaultProps = {
  html: false,
  overlay: false,
  loading: false,
  position: 'middle',
  textAlign: 'center',
};
