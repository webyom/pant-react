import React from 'react';
import clsx from 'clsx';
import { Icon } from '../icon';
import { Overlay } from '../overlay';
import { Transition } from '../transition';
import { getIncrementalZIndex } from '../utils';
import { createBEM } from '../utils/bem';
import { preventDefaultAndStopPropagation } from '../utils/event';
import './index.scss';

export type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type PopupCloseIconPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type PopupProps = {
  name?: string;
  show?: boolean;
  lazyRender?: boolean;
  round?: boolean;
  duration?: number | string;
  closeable?: boolean;
  closeIcon?: string;
  closeIconPosition?: PopupCloseIconPosition;
  safeAreaInsetBottom?: boolean;
  position?: PopupPosition;
  fadeLeave?: boolean;
  overlay?: boolean;
  closeOnClickOverlay?: boolean;
  lockScroll?: boolean;
  style?: Record<string, string | number>;
  zIndex?: number | string;
  className?: string;
  children?: React.ReactChild | React.ReactChild[];
  closePopup?(confirm?: boolean): void;
  onClosed?(): void;
  onOpened?(): void;
  onClick?(event: React.MouseEvent, props: PopupProps): void;
  onClickClose?(event: React.MouseEvent, props: PopupProps): void;
};

type PopupState = {
  active: boolean;
};

const bem = createBEM('pant-popup');

export class Popup extends React.Component<PopupProps, PopupState> {
  private childRef = React.createRef();
  private bindedOnClick = this.onClick.bind(this);
  private bindedOnClickClose = this.onClickClose.bind(this);
  private bindedOnClosed = this.onClosed.bind(this);
  state = {
    active: !!this.props.show,
  };

  static readonly __PANT_NAME__ = 'Popup';

  static defaultProps = {
    closeIcon: 'cross',
    closeIconPosition: 'top-right',
    position: 'center',
    overlay: true,
    closeOnClickOverlay: true,
    lockScroll: true,
  };

  static getDerivedStateFromProps(props: PopupProps): PopupState {
    if (props.show) {
      return { active: true };
    }
    return null;
  }

  private onClick(event: React.MouseEvent): void {
    const props = this.props;
    props.onClick && props.onClick(event, props);
  }

  private onClickClose(event: React.MouseEvent): void {
    const props = this.props;
    const { onClickClose, closePopup } = props;
    onClickClose && onClickClose(event, props);
    closePopup && closePopup();
  }

  private onClosed(): void {
    this.setState({ active: false });
    this.props.onClosed && this.props.onClosed();
  }

  private genChildren(): React.ReactChild | React.ReactChild[] {
    const { closePopup, children } = this.props;
    if (closePopup) {
      return [].concat(children).map(child => {
        this.childRef = child.ref || this.childRef;
        return React.cloneElement(child, {
          ref: this.childRef,
          closePopup: closePopup,
        });
      });
    } else {
      return children;
    }
  }

  getValue(): any {
    const child = this.childRef.current as any;
    return child && child.getValue && child.getValue();
  }

  render(): JSX.Element {
    const props = this.props;

    if (props.lazyRender && !this.state.active) {
      return;
    }

    const { show, zIndex, round, position, duration } = props;
    const incZIndex = zIndex || getIncrementalZIndex();
    const isCenter = position === 'center';
    const transitionName = isCenter || (!show && props.fadeLeave) ? 'fade' : `popup-slide-${position}`;

    const style: Record<string, number | string> = {
      ...props.style,
      zIndex: incZIndex,
    };

    return (
      <React.Fragment>
        {props.overlay ? (
          <Overlay
            show={show}
            zIndex={incZIndex}
            onClick={props.closeOnClickOverlay ? this.bindedOnClickClose : null}
          />
        ) : null}
        <Transition
          customName={transitionName}
          stage={show ? 'enter' : 'leave'}
          duration={duration}
          onAfterEnter={props.onOpened}
          onAfterLeave={this.bindedOnClosed}
        >
          <div
            style={style}
            className={clsx(
              bem({
                round,
                [position]: position,
                'safe-area-inset-bottom': props.safeAreaInsetBottom,
              }),
              props.className,
            )}
            onClick={this.bindedOnClick}
            onTouchMove={props.lockScroll ? preventDefaultAndStopPropagation : null}
          >
            {this.genChildren()}
            {props.closeable && (
              <Icon
                name={props.closeIcon}
                className={bem('close-icon', props.closeIconPosition)}
                onClick={this.bindedOnClickClose}
              />
            )}
          </div>
        </Transition>
      </React.Fragment>
    );
  }
}
