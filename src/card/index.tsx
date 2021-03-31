import React from 'react';
import clsx from 'clsx';
import { Tag } from '../tag';
import { Img } from '../img';
import { isDef } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type CardProps = {
  tag?: string;
  num?: number | string;
  desc?: string;
  thumb?: string;
  title?: string;
  price?: number | string;
  currency?: string;
  centered?: boolean;
  lazyLoad?: boolean;
  thumbLink?: string;
  originPrice?: number | string;
  tagNode?: React.ReactNode;
  tagsNode?: React.ReactNode;
  numNode?: React.ReactNode;
  descNode?: React.ReactNode;
  thumbNode?: React.ReactNode;
  titleNode?: React.ReactNode;
  priceTopNode?: React.ReactNode;
  priceNode?: React.ReactNode;
  originPriceNode?: React.ReactNode;
  bottomNode?: React.ReactNode;
  footerNode?: React.ReactNode;
  onClickThumb?(event: React.MouseEvent): void;
};

const bem = createBEM('pant-card');

export const Card: React.FC<CardProps> = (props) => {
  const { thumb } = props;

  const showNum = isDef(props.num);
  const showPrice = isDef(props.price);
  const showOriginPrice = isDef(props.originPrice);
  const showBottom = showNum || showPrice || showOriginPrice || isDef(props.bottomNode);

  function ThumbTag(): JSX.Element {
    if (props.tagNode || props.tag) {
      return (
        <div className={bem('tag')}>
          {props.tagNode ? (
            props.tagNode
          ) : (
            <Tag mark type="danger">
              {props.tag}
            </Tag>
          )}
        </div>
      );
    }
  }

  function Thumb(): JSX.Element {
    if (props.thumbNode || thumb) {
      return (
        <a href={props.thumbLink} className={bem('thumb')} onClick={props.onClickThumb}>
          {props.thumbNode ? (
            props.thumbNode
          ) : (
            <Img src={thumb} width="100%" height="100%" fit="cover" lazyLoad={props.lazyLoad} />
          )}
          {ThumbTag()}
        </a>
      );
    }
  }

  function Title(): React.ReactNode {
    if (props.titleNode) {
      return props.titleNode;
    }

    if (props.title) {
      return <div className={clsx(bem('title'), 'van-multi-ellipsis--l2')}>{props.title}</div>;
    }
  }

  function Desc(): React.ReactNode {
    if (props.descNode) {
      return props.descNode;
    }

    if (props.desc) {
      return <div className={clsx(bem('desc'), 'van-ellipsis')}>{props.desc}</div>;
    }
  }

  function PriceContent(): JSX.Element {
    const priceArr = props.price.toString().split('.');
    return (
      <div>
        <span className={bem('price-currency')}>{props.currency}</span>
        <span className={bem('price-integer')}>{priceArr[0]}</span>.
        <span className={bem('price-decimal')}>{priceArr[1]}</span>
      </div>
    );
  }

  function Price(): JSX.Element {
    if (showPrice) {
      return <div className={bem('price')}>{props.priceNode ? props.priceNode : PriceContent()}</div>;
    }
  }

  function OriginPrice(): JSX.Element {
    if (showOriginPrice) {
      return (
        <div className={bem('origin-price')}>
          {props.originPriceNode ? props.originPriceNode : `${props.currency} ${props.originPrice}`}
        </div>
      );
    }
  }

  function Num(): JSX.Element {
    if (showNum) {
      return <div className={bem('num')}>{props.numNode ? props.numNode : `x${props.num}`}</div>;
    }
  }

  function Footer(): JSX.Element {
    if (props.footerNode) {
      return <div className={bem('footer')}>{props.footerNode}</div>;
    }
  }

  return (
    <div className={bem()}>
      <div className={bem('header')}>
        {Thumb()}
        <div className={bem('content', { centered: props.centered })}>
          <div>
            {Title()}
            {Desc()}
            {props.tagsNode}
          </div>
          {showBottom && (
            <div className="van-card__bottom">
              {props.priceTopNode}
              {Price()}
              {OriginPrice()}
              {Num()}
              {props.bottomNode}
            </div>
          )}
        </div>
      </div>
      {Footer()}
    </div>
  );
};

Card.defaultProps = {
  currency: '¥',
};
