import React from 'react';
import clsx from 'clsx';
import { Icon } from '../icon';
import { isDef, addUnit } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type ImgProps = {
  src: string;
  fit?: string;
  alt?: string;
  round?: boolean;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  lazyLoad?: boolean;
  showError?: boolean;
  showLoading?: boolean;
  errorNode?: React.ReactNode;
  loadingNode?: React.ReactNode;
  errorIcon?: string;
  loadingIcon?: string;
  onClick?(event: React.MouseEvent): void;
};

type ImgState = {
  error: boolean;
  loading: boolean;
};

const bem = createBEM('pant-img');

export class Img extends React.PureComponent<ImgProps, ImgState> {
  static defaultProps = {
    round: false,
    showError: true,
    showLoading: true,
    errorIcon: 'warning-o',
    loadingIcon: 'photo-o',
  };

  constructor(props: ImgProps) {
    super(props);
    this.state = {
      error: false,
      loading: true,
    };
  }

  genImage(): JSX.Element {
    const props = this.props;
    const imgData = {
      className: bem('img'),
      alt: props.alt,
      style: {
        objectFit: props.fit as any,
      },
    };

    if (this.state.error) {
      return;
    }

    if (props.lazyLoad) {
      // TODO
    }

    return (
      <img
        src={props.src}
        onLoad={(): void => this.setState({ loading: false })}
        onError={(): void => this.setState({ loading: false, error: true })}
        {...imgData}
      />
    );
  }

  genPlaceholder(): JSX.Element {
    const props = this.props;

    if (this.state.loading && props.showLoading) {
      return (
        <div className={bem('loading')}>
          {props.loadingNode || <Icon name={props.loadingIcon} className={bem('loading-icon')} />}
        </div>
      );
    }

    if (this.state.error && props.showError) {
      return (
        <div className={bem('error')}>
          {props.errorNode || <Icon name={props.errorIcon} className={bem('error-icon')} />}
        </div>
      );
    }
  }

  genStyle(): Record<string, string> {
    const props = this.props;
    const style: Record<string, string> = {};

    if (isDef(props.width)) {
      style.width = addUnit(props.width);
    }

    if (isDef(props.height)) {
      style.height = addUnit(props.height);
    }

    if (isDef(props.radius)) {
      style.overflow = 'hidden';
      style.borderRadius = addUnit(props.radius);
    }

    return style;
  }

  render(): JSX.Element {
    const props = this.props;

    return (
      <div
        className={clsx(bem({ round: props.round }), props.className)}
        style={this.genStyle()}
        onClick={this.props.onClick}
      >
        {this.genImage()}
        {this.genPlaceholder()}
      </div>
    );
  }
}
