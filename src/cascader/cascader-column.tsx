import React from 'react';
import { createBEM } from '../utils/bem';
import { ColumnItem } from '.';

type CascaderColumnProps = {
  width: number;
  index: number;
  value?: string;
  items: ColumnItem[];
  onClick?: (index: number, item: ColumnItem) => void;
};

const bem = createBEM('pant-cascader');

export const CascaderColumn: React.FC<CascaderColumnProps> = (props) => {
  const style = { width: props.width + 'px' };

  return (
    <div className={bem('column')} style={style}>
      {props.items.map((item) => {
        return (
          <div
            key={item.value}
            className={bem('item', { selected: item.value === props.value })}
            onClick={() => props.onClick(props.index, item)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};
