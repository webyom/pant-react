import React from 'react';
import { isDef } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type InfoProps = {
  dot?: boolean;
  info?: string | number;
};

const bem = createBEM('pant-info');

export const Info: React.FC<InfoProps> = (props) => {
  const { dot, info } = props;
  const showInfo = isDef(info) && info !== '';

  if (!dot && !showInfo) {
    return null;
  }

  return <div className={bem({ dot })}>{dot ? '' : info}</div>;
};
