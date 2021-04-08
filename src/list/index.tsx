import React from 'react';
import { on, off } from '../utils/event';
import { isHidden } from '../utils/dom';
import { createBEM } from '../utils/bem';
import { getScroller, ScrollElement } from '../utils/scroll';
import { Loading } from '../loading';
import { i18n } from '../locale';
import './index.scss';

type ListDirection = 'up' | 'down';

export type ListLoadResult = {
  finished?: boolean;
  error?: boolean;
  errorText?: string;
  errorNode?: React.ReactNode;
};

export type ListProps = {
  direction?: ListDirection;
  offset?: number | string;
  loadingText?: string;
  finishedText?: string;
  errorText?: string;
  loadingNode?: React.ReactNode;
  finishedNode?: React.ReactNode;
  errorNode?: React.ReactNode;
  onLoad(error?: boolean): Promise<ListLoadResult | void>;
};

type ListState = {
  loading: boolean;
  loadResult: ListLoadResult;
};

const bem = createBEM('pant-list');

export class List extends React.PureComponent<ListProps, ListState> {
  static defaultProps = {
    direction: 'down',
    offset: 300,
  };

  private containerRef = React.createRef<HTMLDivElement>();
  private placeholderRef = React.createRef<HTMLDivElement>();
  private scroller: ScrollElement;

  constructor(props: ListProps) {
    super(props);
    this.state = {
      loading: false,
      loadResult: {},
    };
    this.check = this.check.bind(this);
    this.onClickError = this.onClickError.bind(this);
  }

  componentDidMount(): void {
    this.scroller = getScroller(this.containerRef.current);
    on(this.scroller, 'scroll', this.check);
    this.check();
  }

  componentDidUpdate(): void {
    this.check();
  }

  componentWillUnmount(): void {
    off(this.scroller, 'scroll', this.check);
    this.scroller = null;
  }

  reset(callback?: () => void): void {
    this.setState({ loading: false, loadResult: {} }, callback);
  }

  check(): void {
    const { loading, loadResult } = this.state;
    if (loading || loadResult.finished || loadResult.error) {
      return;
    }

    if (isHidden(this.containerRef.current)) {
      return;
    }

    const scroller = this.scroller as any;
    const { offset, direction } = this.props;
    let scrollerRect;

    if (scroller.getBoundingClientRect) {
      scrollerRect = scroller.getBoundingClientRect();
    } else {
      scrollerRect = {
        top: 0,
        bottom: scroller.innerHeight,
      };
    }

    const scrollerHeight = scrollerRect.bottom - scrollerRect.top;

    if (!scrollerHeight) {
      return;
    }

    let isReachEdge = false;
    const placeholderRect = this.placeholderRef.current.getBoundingClientRect();

    if (direction === 'up') {
      isReachEdge = scrollerRect.top - placeholderRect.top <= offset;
    } else {
      isReachEdge = placeholderRect.bottom - scrollerRect.bottom <= offset;
    }

    if (isReachEdge) {
      this.load();
    }
  }

  private load(error?: boolean): void {
    this.setState({ loading: true, loadResult: {} }, () => {
      this.props.onLoad(error).then((res) => {
        this.setState({ loading: false, loadResult: res || {} });
      });
    });
  }

  private genLoading(): JSX.Element {
    const { loading, loadResult } = this.state;
    const { loadingText, loadingNode } = this.props;
    if (loading && !loadResult.finished) {
      return (
        <div className={bem('loading')} key="loading">
          {loadingNode || <Loading size="16">{loadingText || i18n().loading}</Loading>}
        </div>
      );
    }
  }

  private genFinishedText(): JSX.Element {
    const { loadResult } = this.state;
    const { finishedText, finishedNode } = this.props;
    if (loadResult.finished) {
      const text = finishedNode || finishedText;

      if (text) {
        return <div className={bem('finished-text')}>{text}</div>;
      }
    }
  }

  private genErrorText(): JSX.Element {
    const { loadResult } = this.state;
    const { errorText, errorNode } = this.props;
    if (loadResult.error) {
      const text = loadResult.errorNode || loadResult.errorText || errorNode || errorText;

      if (text) {
        return (
          <div onClick={this.onClickError} className={bem('error-text')}>
            {text}
          </div>
        );
      }
    }
  }

  private onClickError(): void {
    this.load(true);
  }

  render(): JSX.Element {
    const { direction, children } = this.props;
    const Placeholder = <div ref={this.placeholderRef} className={bem('placeholder')} />;
    return (
      <div ref={this.containerRef} className={bem()} role="feed" aria-busy={this.state.loading}>
        {direction === 'down' ? children : Placeholder}
        {this.genLoading()}
        {this.genFinishedText()}
        {this.genErrorText()}
        {direction === 'up' ? children : Placeholder}
      </div>
    );
  }
}
