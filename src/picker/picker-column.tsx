import React from 'react';
import clsx from 'clsx';
import { createBEM } from '../utils/bem';
import { preventDefaultAndStopPropagation } from '../utils/event';
import { TouchHandler } from '../utils/touch-handler';
import { range } from '../utils/number';
import { MOMENTUM_LIMIT_TIME, DEFAULT_DURATION, MOMENTUM_LIMIT_DISTANCE } from './constant';
import { StandardColumnItem } from '.';
import './index.scss';

function getElementTranslateY(element: HTMLUListElement): number {
  const style = window.getComputedStyle(element);
  const transform = style.transform || style.webkitTransform;
  const translateY = transform.slice(7, transform.length - 1).split(', ')[5];

  return Number(translateY);
}

const getIndex = (options: StandardColumnItem[], value: string): number => {
  let index = 0;
  options.forEach((item: StandardColumnItem, itemIndex: number) => {
    if (item.value === value) {
      index = itemIndex;
    }
  });
  return index;
};

export type PickerProps = {
  visibleItemCount: number;
  options: StandardColumnItem[];
  className?: string;
  itemHeight?: number;
  value?: string;
  onChange?: (value: number) => void;
  swipeDuration?: number;
  injectChildren?: (column: PickerColumn) => void;
  disabledValue?: string;
};

type PickerState = {
  currentIndex: number;
  offset: number;
  baseOffset: number;
  duration: number;
  moving: boolean;
  prevOptions: StandardColumnItem[];
  prevValue: string;
};

const bem = createBEM('pant-picker-column');

export class PickerColumn extends React.PureComponent<PickerProps, PickerState> {
  private listRef = React.createRef<HTMLUListElement>();
  private transitionEndTrigger: any;
  private touchHandler: TouchHandler;
  startOffset: number;
  touchStartTime: number;
  momentumOffset: number;

  constructor(props: PickerProps) {
    super(props);
    this.state = {
      currentIndex: 0,
      offset: 0,
      duration: 0,
      baseOffset: (this.props.itemHeight * (this.props.visibleItemCount - 1)) / 2,
      moving: false,
      prevOptions: [],
      prevValue: '',
    };
    this.setIndex = this.setIndex.bind(this);
  }

  componentDidMount(): void {
    const listEl = this.listRef.current;
    this.props.injectChildren(this);
    this.touchHandler = new TouchHandler(listEl, {
      onTouchStart: this.onTouchStart.bind(this),
      onTouchMove: this.onTouchMove.bind(this),
      onTouchEnd: this.onTouchEnd.bind(this),
    });
    listEl.addEventListener('transitionend', this.onTransitionEnd.bind(this), false);
  }

  componentWillUnmount(): void {
    this.touchHandler.destroy();
    this.touchHandler = null;
  }

  static getDerivedStateFromProps(nextProps: PickerProps, state: PickerState): PickerState {
    const { options, value, itemHeight } = nextProps;
    const { prevOptions, prevValue } = state;
    if (options !== prevOptions || value !== prevValue) {
      return {
        ...state,
        currentIndex: getIndex(options, value),
        offset: -getIndex(options, value) * itemHeight,
        prevOptions: options,
        prevValue: value,
      };
    }
    return null;
  }

  onClickItem(index: number): void {
    if (this.state.moving) {
      return;
    }

    this.transitionEndTrigger = null;
    this.setState({
      duration: DEFAULT_DURATION,
    });
    this.setIndex(index);
  }

  // ??????index????????????????????????
  adjustIndex(index: number): number {
    const { options, disabledValue } = this.props;
    const length = options.length;
    index = range(index, 0, length);
    for (let i = index; i < length; i++) {
      if (options[i].value !== disabledValue) return i;
    }

    for (let i = index - 1; i >= 0; i--) {
      if (options[i].value !== disabledValue) return i;
    }
  }

  // ???????????????offset?????????????????????
  setIndex(index: number): void {
    const props = this.props;
    // ??????????????????touchEnd?????????click?????????????????????index???????????????????????????????????????
    if (index === this.state.currentIndex && this.state.offset === -index * props.itemHeight) {
      return;
    }

    index = this.adjustIndex(index);
    if (index === undefined) {
      return;
    }
    const offset = -index * props.itemHeight;

    const trigger = (): void => {
      props.onChange(index);
    };

    // trigger the change event after transitionend when moving
    if (this.state.moving && offset !== this.state.offset) {
      this.transitionEndTrigger = trigger;
    } else {
      trigger();
    }
    this.setState({
      offset,
      currentIndex: index,
    });
  }

  getIndexByOffset(offset: number): number {
    return range(Math.round(-offset / this.props.itemHeight), 0, this.props.options.length - 1);
  }

  onTouchStart(): void {
    if (this.state.moving) {
      const translateY = getElementTranslateY(this.listRef.current);
      this.setState(
        {
          offset: Math.min(0, translateY - this.state.baseOffset),
        },
        () => {
          this.startOffset = this.state.offset;
        },
      );
    } else {
      this.startOffset = this.state.offset;
    }

    this.setState({
      duration: 0,
    });
    this.transitionEndTrigger = null;
    this.touchStartTime = Date.now();
    this.momentumOffset = this.startOffset;
  }

  onTouchMove(event: React.TouchEvent): void {
    const { itemHeight, options } = this.props;
    const { direction, deltaY } = this.touchHandler.state;
    if (direction === 'vertical') {
      this.setState({
        moving: true,
      });
      preventDefaultAndStopPropagation(event);
    }

    this.setState({
      offset: range(this.startOffset + deltaY, -(options.length * itemHeight), itemHeight),
    });

    const now = Date.now();
    if (now - this.touchStartTime > MOMENTUM_LIMIT_TIME) {
      this.touchStartTime = now;
      this.momentumOffset = this.state.offset;
    }
  }

  onTouchEnd(): void {
    const distance = this.state.offset - this.momentumOffset;
    const duration = Date.now() - this.touchStartTime;
    const allowMomentum = duration < MOMENTUM_LIMIT_TIME && Math.abs(distance) > MOMENTUM_LIMIT_DISTANCE;
    if (allowMomentum) {
      this.momentum(distance, duration);
      return;
    }
    this.setState({
      duration: DEFAULT_DURATION,
    });

    // ??????????????????
    const index = this.getIndexByOffset(this.state.offset);
    this.setIndex(index);
    // compatible with desktop scenario
    // use setTimeout to skip the click event triggered after touchstart
    setTimeout(() => {
      this.setState({
        moving: false,
      });
    }, 0);
  }

  // ????????????
  momentum(distance: number, duration: number): void {
    const speed = Math.abs(distance / duration);

    distance = this.state.offset + (speed / 0.003) * (distance < 0 ? -1 : 1);

    const index = this.getIndexByOffset(distance);

    this.setState({
      duration: +this.props.swipeDuration,
    });
    this.setIndex(index);
  }

  genOptions(): any {
    const { options, value, itemHeight, disabledValue } = this.props;
    const optionStyle = {
      height: `${itemHeight}px`,
    };

    return options.map((option: StandardColumnItem, index: number) => {
      const data = {
        style: optionStyle,
        className: clsx(
          bem('item', {
            disabled: option.value === disabledValue,
            selected: option.value === value,
          }),
        ),
        onClick: (): void => {
          this.onClickItem(index);
        },
      };

      const childData = {
        className: 'pant-ellipsis',
      };
      return (
        <li key={index} {...data}>
          <div {...childData}>{option.label}</div>
        </li>
      );
    });
  }

  onTransitionEnd(): void {
    this.stopMomentum();
  }

  stopMomentum(): void {
    this.setState({
      moving: false,
      duration: 0,
    });
    if (this.transitionEndTrigger) {
      this.transitionEndTrigger();
      this.transitionEndTrigger = null;
    }
  }

  render(): JSX.Element {
    const { offset, baseOffset, duration } = this.state;
    const wrapperStyle = {
      transform: `translate3d(0, ${offset + baseOffset}px, 0)`,
      transitionDuration: `${duration}ms`,
      transitionProperty: duration ? 'all' : 'none',
    };
    return (
      <div className={clsx(bem(), this.props.className)}>
        <ul ref={this.listRef} style={wrapperStyle} className={bem('wrapper')}>
          {this.genOptions()}
        </ul>
      </div>
    );
  }
}
