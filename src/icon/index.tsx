import React, { MouseEvent, TouchEvent } from 'react';
import clsx from 'clsx';
import { addUnit } from '../utils';
import { createBEM } from '../utils/bem';
import { Info } from '../info';
import './index.scss';

export type IconProps = {
  name: string;
  dot?: boolean;
  size?: number | string;
  color?: string;
  info?: number | string;
  className?: string;
  classPrefix?: string;
  style?: Record<string, string>;
  onClick?(event: MouseEvent): void;
  onTouchStart?(event: TouchEvent): void;
};

const bem = createBEM('pant-icon');

function isImage(name?: string): boolean {
  return name ? name.indexOf('/') !== -1 : false;
}

export const Icon: React.FC<IconProps> = props => {
  const name = props.name;
  const imageIcon = isImage(name);

  return (
    <i
      className={clsx(props.classPrefix + (imageIcon ? '' : ` ${props.classPrefix}-${name}`), props.className)}
      style={{
        color: props.color,
        fontSize: addUnit(props.size),
        ...props.style,
      }}
      onClick={props.onClick}
      onTouchStart={props.onTouchStart}
    >
      {imageIcon && <img className={bem('image')} src={name} />}
      <Info dot={props.dot} info={props.info} />
    </i>
  );
};

Icon.defaultProps = {
  classPrefix: 'pant-icon',
};
