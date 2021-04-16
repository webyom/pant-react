import React from 'react';
import { createBEM } from '../utils/bem';
import { ColumnItem } from '.';

type CascaderColumnProps = {
  maxSelection: number;
  width: number;
  index: number;
  value?: string;
  items: ColumnItem[];
  isItemSelected: (columnIndex: number, item: ColumnItem) => boolean;
  hasChildrenSelected: (columnIndex: number, item: ColumnItem) => boolean;
  onClick: (columnIndex: number, item: ColumnItem) => void;
};

const bem = createBEM('pant-cascader');

export const CascaderColumn: React.FC<CascaderColumnProps> = (props) => {
  const { width, index, value, items, isItemSelected, hasChildrenSelected, onClick } = props;
  const style = { width: width + 'px' };

  return (
    <div className={bem('column')} style={style}>
      {items.map((item) => {
        return (
          <div
            key={item.value}
            className={bem('item', { selected: item.value === value })}
            onClick={() => onClick(index, item)}
          >
            {item.label}
            {item.children ? (hasChildrenSelected(index, item) ? '*' : '') : isItemSelected(index, item) ? '1' : '0'}
          </div>
        );
      })}
    </div>
  );
};
