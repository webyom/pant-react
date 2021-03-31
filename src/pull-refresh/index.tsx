import React from 'react';
import { addUnit } from '../utils';
import { preventDefault } from '../utils/event';
import { createBEM } from '../utils/bem';
import { getScroller, getScrollTop, ScrollElement } from '../utils/scroll';
import { TouchHandler } from '../utils/touch-handler';
import { Loading } from '../loading';
import { i18n } from '../locale';
import './index.scss';

const DEFAULT_HEAD_HEIGHT = 50;

export type PullRefreshProps = {
  disabled?: boolean;
  successText?: string;
  pullingText?: string;
  loosingText?: string;
  loadingText?: string;
  successNode?: React.ReactNode;
  pullingNode?: JSX.Element;
  loosingNode?: React.ReactNode;
  loadingNode?: React.ReactNode;
  successDuration?: number | string;
  animationDuration?: number | string;
  headHeight?: number | string;
  onRefresh?(): Promise<void>;
};

type PullRefreshStatus = 'normal' | 'pulling' | 'loosing' | 'loading' | 'success';

type PullRefreshState = {
  status: PullRefreshStatus;
  distance: number;
};

const bem = createBEM('pant-pull-refresh');

export class PullRefresh extends React.Component<PullRefreshProps, PullRefreshState> {
  static defaultProps = {
    successDuration: 500,
    animationDuration: 300,
    headHeight: DEFAULT_HEAD_HEIGHT,
  };

  private containerRef = React.createRef<HTMLDivElement>();
  private ceiling = false;
  private scroller: ScrollElement;
  private touchHandler: TouchHandler;

  constructor(props: PullRefreshProps) {
    super(props);
    this.state = {
      status: 'normal',
      distance: 0,
    };
  }

  componentDidMount(): void {
    this.scroller = getScroller(this.containerRef.current);
    this.touchHandler = new TouchHandler(this.containerRef.current, {
      onBeforeTouchStart: this.onBeforeTouchStart.bind(this),
      onTouchMove: this.onTouchMove.bind(this),
      onBeforeTouchMove: this.onBeforeTouchMove.bind(this),
      onTouchEnd: this.onTouchEnd.bind(this),
    });
  }

  componentWillUnmount(): void {
    this.touchHandler.destroy();
    this.touchHandler = null;
    this.scroller = null;
  }

  private get touchable(): boolean {
    const { status } = this.state;
    return status !== 'loading' && status !== 'success' && !this.props.disabled;
  }

  private checkPullStart(event: TouchEvent): void {
    this.ceiling = getScrollTop(this.scroller) === 0;

    if (this.ceiling) {
      this.touchHandler.touchStart(event);
    }
  }

  private onBeforeTouchStart(event: TouchEvent): boolean | void {
    if (!this.touchable) {
      return false;
    }
    this.checkPullStart(event);
    return false;
  }

  private onBeforeTouchMove(event: TouchEvent): boolean | void {
    if (!this.touchable) {
      return false;
    }
    if (!this.ceiling) {
      this.checkPullStart(event);
    }
    return this.ceiling;
  }

  private onTouchMove(event: React.TouchEvent): void {
    const { deltaY, direction } = this.touchHandler.state;
    if (deltaY >= 0 && direction === 'vertical') {
      preventDefault(event);
      this.setStatus(this.ease(deltaY));
    }
  }

  private onTouchEnd(): void {
    const { status } = this.state;
    const props = this.props;
    const { headHeight, onRefresh, successDuration } = props;
    const { deltaY } = this.touchHandler.state;
    if (this.touchable && this.ceiling && deltaY) {
      if (status === 'loosing' && onRefresh) {
        this.setStatus(+headHeight, true);
        onRefresh().finally(() => {
          if (props.successNode || props.successText) {
            this.setState({ status: 'success' }, () => {
              setTimeout(() => {
                this.setStatus(0);
              }, +successDuration);
            });
          } else {
            this.setStatus(0);
          }
        });
      } else {
        this.setStatus(0);
      }
    }
  }

  private ease(distance: number): number {
    const headHeight = +this.props.headHeight;

    if (distance > headHeight) {
      if (distance < headHeight * 2) {
        distance = headHeight + (distance - headHeight) / 2;
      } else {
        distance = headHeight * 1.5 + (distance - headHeight * 2) / 4;
      }
    }

    return Math.round(distance);
  }

  private setStatus(distance: number, isLoading?: boolean): void {
    let status: PullRefreshStatus;
    if (isLoading) {
      this.ceiling = false;
      status = 'loading';
    } else if (distance === 0) {
      this.ceiling = false;
      status = 'normal';
    } else {
      status = distance < this.props.headHeight ? 'pulling' : 'loosing';
    }
    this.setState({ status, distance });
  }

  private genStatus(): React.ReactNode {
    const props = this.props;
    const { status, distance } = this.state;

    if (status === 'success') {
      return props.successNode || <div className={bem('text')}>{props.successText}</div>;
    }
    if (status === 'loading') {
      return props.loadingNode || <Loading size="16">{props.loadingText || i18n().loading}</Loading>;
    }
    if (status === 'loosing') {
      return props.loosingNode || <div className={bem('text')}>{props.loosingText || i18n().pullRefresh.loosing}</div>;
    }
    if (status === 'pulling') {
      return (
        (props.pullingNode && React.cloneElement(props.pullingNode, { distance })) || (
          <div className={bem('text')}>{props.pullingText || i18n().pullRefresh.pulling}</div>
        )
      );
    }
  }

  render(): JSX.Element {
    const { animationDuration, headHeight, children } = this.props;
    const { distance } = this.state;
    const duration = this.ceiling ? 0 : animationDuration;
    const trackStyle = {
      transitionDuration: `${duration}ms`,
      transform: distance ? `translate3d(0,${distance}px, 0)` : '',
    };
    const headStyle =
      headHeight !== DEFAULT_HEAD_HEIGHT
        ? {
            height: addUnit(headHeight),
          }
        : null;

    return (
      <div ref={this.containerRef} className={bem()}>
        <div className={bem('track')} style={trackStyle}>
          <div className={bem('head')} style={headStyle}>
            {this.genStatus()}
          </div>
          {children}
        </div>
      </div>
    );
  }
}
