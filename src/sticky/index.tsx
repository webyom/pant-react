import React from 'react';
import { isDef, addUnit, removeUnit } from '../utils';
import { isHidden } from '../utils/dom';
import { on, off } from '../utils/event';
import {
  getScrollTop,
  getElementTop,
  getScroller,
  getViewportSize,
  getVisibleHeight,
  ScrollElement,
  isRootScroller,
} from '../utils/scroll';
import { createBEM } from '../utils/bem';
import './index.scss';

export type StickyProps = {
  keepWidth?: boolean;
  zIndex?: number | string;
  offsetTop?: number | string;
  offsetBottom?: number | string;
  stickBottom?: boolean;
  container?: React.RefObject<HTMLElement>;
  scroller?: ScrollElement;
};

type StickyState = {
  fixed: boolean;
  height: number;
  left: number;
  width: number;
  transform: number;
};

const bem = createBEM('pant-sticky');

export class Sticky extends React.PureComponent<StickyProps, StickyState> {
  static defaultProps = {
    keepWidth: true,
    offsetTop: 0,
    offsetBottom: 0,
  };

  private domRef = React.createRef<HTMLDivElement>();
  private bindedOnScroll = this.onScroll.bind(this);
  private bindedOnRootScroll = this.onRootScroll.bind(this);
  private scroller: ScrollElement;
  private toRef: NodeJS.Timeout = null;

  state = {
    fixed: false,
    height: 0,
    left: 0,
    width: 0,
    transform: 0,
  };

  componentDidMount(): void {
    const el = this.domRef.current;
    this.scroller = this.props.scroller || getScroller(el);
    on(this.scroller, 'scroll', this.bindedOnScroll);
    if (!isRootScroller(this.scroller)) {
      on(window, 'scroll', this.bindedOnRootScroll);
    }
    this.onRootScroll();
    this.toRef = setInterval(() => {
      this.onRootScroll();
    }, 1000);
  }

  componentWillUnmount(): void {
    off(this.scroller, 'scroll', this.bindedOnScroll);
    if (!isRootScroller(this.scroller)) {
      off(window, 'scroll', this.bindedOnRootScroll);
    }
  }

  private getStyle(): Record<string, string | number> {
    const { keepWidth, zIndex, offsetTop, offsetBottom, stickBottom } = this.props;
    const { left, width, fixed, transform } = this.state;

    if (!fixed) {
      return;
    }

    const style: Record<string, string | number> = {};

    if (isDef(zIndex)) {
      style.zIndex = zIndex;
    }

    if (fixed) {
      if (stickBottom) {
        if (isRootScroller(this.scroller)) {
          style.bottom = addUnit(offsetBottom);
        } else {
          const { height } = getViewportSize();
          const { bottom } = (this.scroller as HTMLElement).getBoundingClientRect();
          style.bottom = addUnit(+offsetBottom + height - bottom);
        }
      } else {
        if (isRootScroller(this.scroller)) {
          style.top = addUnit(offsetTop);
        } else {
          const { top } = (this.scroller as HTMLElement).getBoundingClientRect();
          style.top = addUnit(+offsetTop + top);
        }
      }
    }

    if (keepWidth) {
      style.left = addUnit(left);
      style.width = addUnit(width);
    }

    if (transform) {
      style.transform = `translate3d(0, ${transform}px, 0)`;
    }

    return style;
  }

  get fixed(): boolean {
    return this.state.fixed;
  }

  stick(isRootScroll?: boolean): void {
    const el = this.domRef.current;
    const { left, width } = el.getBoundingClientRect();
    const height = el.offsetHeight;
    let fixed = false;
    let transform = 0;

    const { container, offsetTop, offsetBottom } = this.props;
    const offsetTopNumber = removeUnit(offsetTop);
    const scrollTop = getScrollTop(this.scroller);
    const topToScrollerTop = getElementTop(el, this.scroller);

    // The sticky component should be kept inside the container element
    if (container) {
      const containerEl = container.current;
      const bottomToScrollerTop = getElementTop(containerEl, this.scroller) + containerEl.offsetHeight;
      const offsetBottomNumber = removeUnit(offsetBottom);

      if (scrollTop + offsetTopNumber + height + offsetBottomNumber > bottomToScrollerTop) {
        const distanceToBottom = height + scrollTop - bottomToScrollerTop;

        if (distanceToBottom < height) {
          fixed = true;
          transform = -(distanceToBottom + offsetTopNumber + offsetBottomNumber);
        }
        this.setState({ height, left, width, fixed, transform });
        if (isRootScroll && !isRootScroller(this.scroller)) {
          this.forceUpdate();
        }
        return;
      }
    }

    if (scrollTop + offsetTopNumber > topToScrollerTop) {
      fixed = true;
    }
    this.setState({ height, left, width, fixed, transform });
    if (isRootScroll && !isRootScroller(this.scroller)) {
      this.forceUpdate();
    }
  }

  stickBottom(isRootScroll?: boolean): void {
    const el = this.domRef.current;
    const { left, width } = el.getBoundingClientRect();
    const height = el.offsetHeight;
    let fixed = false;
    let transform = 0;

    const { container, offsetTop, offsetBottom } = this.props;
    const offsetBottomNumber = removeUnit(offsetBottom);
    const scrollTop = getScrollTop(this.scroller);
    const topToScrollerTop = getElementTop(el, this.scroller);
    const viewportHeight = getVisibleHeight(this.scroller);

    // The sticky component should be kept inside the container element
    if (container) {
      const containerEl = container.current;
      const containerTopToScrollerTop = getElementTop(containerEl, this.scroller);
      const offsetTopNumber = removeUnit(offsetTop);

      if (containerTopToScrollerTop + offsetTopNumber + height + offsetBottomNumber > scrollTop + viewportHeight) {
        const distanceToBottom = height + containerTopToScrollerTop - scrollTop - viewportHeight;

        if (distanceToBottom < height) {
          fixed = true;
          transform = distanceToBottom + offsetTopNumber + offsetBottomNumber;
        }
        this.setState({ height, left, width, fixed, transform });
        if (isRootScroll && !isRootScroller(this.scroller)) {
          this.forceUpdate();
        }
        return;
      }
    }

    if (scrollTop + viewportHeight < topToScrollerTop + height + offsetBottomNumber) {
      fixed = true;
    }
    this.setState({ height, left, width, fixed, transform });
    if (isRootScroll && !isRootScroller(this.scroller)) {
      this.forceUpdate();
    }
  }

  onScroll(_: Event, isRootScroll?: boolean): void {
    clearInterval(this.toRef);
    const el = this.domRef.current;
    if (isHidden(el)) {
      return;
    }
    const { container } = this.props;
    if (container && !container.current) {
      return;
    }
    this.props.stickBottom ? this.stickBottom(isRootScroll) : this.stick(isRootScroll);
  }

  onRootScroll(evt?: Event): void {
    this.onScroll(evt, true);
  }

  render(): JSX.Element {
    const props = this.props;

    const { fixed, height } = this.state;
    const warpperStyle = {
      height: fixed ? `${height}px` : null,
    };

    return (
      <div ref={this.domRef} style={warpperStyle}>
        <div className={bem({ fixed })} style={this.getStyle()}>
          {props.children}
        </div>
      </div>
    );
  }
}
