import React from 'react';
import { createBEM } from '../utils/bem';
import './index.scss';

export type ColProps = {
  span?: number | string;
  offset?: number | string;
  gutter?: number | string;
  children?: React.ReactNode;
  onClick?(event: React.MouseEvent): void;
};

const bem = createBEM('pant-col');

export const Col: React.FC<ColProps> = props => {
  const { span, offset } = props;
  const gutter = Number(props.gutter) || 0;
  const padding = `${gutter / 2}px`;
  const style = gutter ? { paddingLeft: padding, paddingRight: padding } : {};

  return (
    <div style={style} className={bem({ [span]: span, [`offset-${offset}`]: offset })} onClick={props.onClick}>
      {props.children}
    </div>
  );
};

Col.defaultProps = {
  gutter: 0,
};
