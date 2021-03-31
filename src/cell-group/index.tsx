import React from 'react';
import clsx from 'clsx';
import { BORDER_TOP_BOTTOM } from '../utils/constant';
import { createBEM } from '../utils/bem';
import './index.scss';

export type CellGroupProps = {
  title?: string | JSX.Element;
  border?: boolean;
};

const bem = createBEM('pant-cell-group');

export const CellGroup: React.FC<CellGroupProps> = (props) => {
  const Group = <div className={clsx(bem(), { [BORDER_TOP_BOTTOM]: props.border })}>{props.children}</div>;

  if (props.title) {
    return (
      <div>
        <div className={bem('title')}>{props.title}</div>
        {Group}
      </div>
    );
  }

  return Group;
};
