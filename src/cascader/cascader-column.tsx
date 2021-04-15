import React from 'react';
import { createBEM } from '../utils/bem';
import { ColumnItem } from '.';

type CascaderColumnProps = {
  width: number;
  index: number;
  value?: string;
  items: ColumnItem[];
  onClick?: (index: number, value: string) => void;
};

const bem = createBEM('pant-cascader');

export const CascaderColumn: React.FC<CascaderColumnProps> = (props) => {
  const width = Math.max(100, Math.min(props.width, 300));
  const style = { width: width + 'px' };

  return (
    <div className={bem('column')} style={style}>
      {props.items.map((item) => {
        return (
          <div
            key={item.value}
            className={bem('item', { selected: item.value === props.value })}
            onClick={() => props.onClick(props.index, item.value)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};
