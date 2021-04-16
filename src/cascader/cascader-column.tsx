import React from 'react';
import { Icon } from '../icon';
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

  const genChildrenSelectedMark = (item: ColumnItem) => {
    if (item.children && hasChildrenSelected(index, item)) {
      return <div className={bem('children-selected')}></div>;
    }
  };

  const genItemSelectedMark = (item: ColumnItem) => {
    if (item.children) {
      return;
    }
    const selected = isItemSelected(index, item);
    return (
      <div className={bem('item-selection', { selected })}>
        <Icon name={selected ? 'passed' : 'circle'} />
      </div>
    );
  };

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
            {genChildrenSelectedMark(item)}
            {genItemSelectedMark(item)}
          </div>
        );
      })}
    </div>
  );
};
