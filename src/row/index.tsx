import React from 'react';
import { createBEM } from '../utils/bem';
import './index.scss';

export type RowProps = {
  type?: 'flex';
  align?: string;
  justify?: string;
  gutter?: number | string;
  onClick?(event: React.MouseEvent): void;
  children: React.ReactNode;
};

const bem = createBEM('pant-row');

export const Row: React.FC<RowProps> = (props) => {
  const { align, justify } = props;
  const flex = props.type === 'flex';
  const margin = `-${Number(props.gutter) / 2}px`;
  const style = props.gutter ? { marginLeft: margin, marginRight: margin } : {};
  const childrenWithProps = []
    .concat(props.children)
    .map((child, i) => React.cloneElement(child, { key: i, gutter: props.gutter }));

  return (
    <div
      style={style}
      className={bem({
        flex,
        [`align-${align}`]: flex && align,
        [`justify-${justify}`]: flex && justify,
      })}
      onClick={props.onClick}
    >
      {childrenWithProps}
    </div>
  );
};

Row.defaultProps = {
  gutter: 0,
};
