import React from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import { Icon } from '../icon';
import { Overlay } from '../overlay';
import { Transition } from '../transition';
import { getIncrementalZIndex } from '../utils';
import { eventBus } from '../utils/event-bus';
import { createBEM } from '../utils/bem';
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
  children?: React.ReactElement;
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

let idStart: number = Math.floor(Math.random() * 10000);

export class Popup extends React.PureComponent<PopupProps, PopupState> {
  private id = ++idStart;
  private zIndex = this.props.zIndex || getIncrementalZIndex();
  private containerRef = React.createRef<HTMLDivElement>();
  private childRef = React.createRef();
  private bindedOnClick = this.onClick.bind(this);
  private bindedOnClickClose = this.onClickClose.bind(this);
  private bindedOnClosed = this.onClosed.bind(this);
  private bindedOnOpened = this.onOpened.bind(this);
  state = {
    active: !!this.props.show,
  };

  static readonly __FIELD_BEHAVIOR__ = 'Popup';

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

  private onOpened(): void {
    eventBus.emit('popup.opened', this.id);
    this.props.onOpened && this.props.onOpened();
  }

  private genChildren(): React.ReactNode {
    const { closePopup, children } = this.props;
    if (!children || typeof children === 'string' || typeof children.type === 'string') {
      return children;
    }
    this.childRef = (children as any).ref || this.childRef;
    return React.cloneElement(children, {
      _popupId: this.id,
      key: children.key,
      ref: this.childRef,
      closePopup: closePopup,
    });
  }

  getValue(): any {
    const child = this.childRef.current as any;
    return child && child.getValue && child.getValue();
  }

  clearValue(cb: () => void): void {
    const child = this.childRef.current as any;
    return child && child.clearValue && child.clearValue(cb);
  }

  render(): JSX.Element {
    const props = this.props;

    if (props.lazyRender && !this.state.active) {
      return null;
    }

    const { show, round, position, duration } = props;
    const isCenter = position === 'center';
    const transitionName = isCenter || (!show && props.fadeLeave) ? 'fade' : `popup-slide-${position}`;

    const style: Record<string, number | string> = {
      ...props.style,
      zIndex: this.zIndex,
    };

    return ReactDOM.createPortal(
      <React.Fragment>
        {props.overlay ? (
          <Overlay
            show={show}
            zIndex={this.zIndex}
            lockScroll={props.lockScroll}
            onClick={props.closeOnClickOverlay ? this.bindedOnClickClose : null}
          />
        ) : null}
        <Transition
          customName={transitionName}
          stage={show ? 'enter' : 'leave'}
          duration={duration}
          onAfterEnter={this.bindedOnOpened}
          onAfterLeave={this.bindedOnClosed}
        >
          <div
            ref={this.containerRef}
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
      </React.Fragment>,
      document.body,
    );
  }
}
