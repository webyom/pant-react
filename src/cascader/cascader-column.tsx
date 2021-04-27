import React from 'react';
import { Icon } from '../icon';
import { createBEM } from '../utils/bem';
import { ColumnItem, StandardColumnItem } from '.';

type CascaderColumnProps = {
  maxSelection: number;
  width: number;
  index: number;
  value?: string;
  items: ColumnItem[];
  checkedIcon?: JSX.Element;
  uncheckedIcon?: JSX.Element;
  normalizeItem: (item: ColumnItem) => StandardColumnItem;
  isItemSelected: (columnIndex: number, item: StandardColumnItem) => boolean;
  hasChildrenSelected: (columnIndex: number, item: StandardColumnItem) => boolean;
  onClick: (columnIndex: number, item: StandardColumnItem) => void;
};

const bem = createBEM('pant-cascader');

export const CascaderColumn: React.FC<CascaderColumnProps> = (props) => {
  const {
    width,
    index,
    value,
    items,
    checkedIcon,
    uncheckedIcon,
    isItemSelected,
    hasChildrenSelected,
    normalizeItem,
    onClick,
  } = props;
  const style = { width: width + 'px' };

  const genChildrenSelectedMark = (item: StandardColumnItem) => {
    if (item.children && hasChildrenSelected(index, item)) {
      return <div className={bem('children-selected')}></div>;
    }
  };

  const genItemSelectedMark = (item: StandardColumnItem) => {
    if (item.children) {
      return;
    }
    const selected = isItemSelected(index, item);
    return (
      <div className={bem('item-selection', { selected })}>
        {selected ? (
          checkedIcon !== undefined ? (
            checkedIcon
          ) : (
            <Icon name="passed" />
          )
        ) : uncheckedIcon !== undefined ? (
          uncheckedIcon
        ) : (
          <Icon name="circle" />
        )}
      </div>
    );
  };

  return (
    <div className={bem('column')} style={style}>
      {items.map((item) => {
        const stdItem = normalizeItem(item);
        return (
          <div
            key={item.value}
            className={bem('item', { selected: item.value === value })}
            onClick={() => onClick(index, stdItem)}
          >
            {item.label}
            {genChildrenSelectedMark(stdItem)}
            {genItemSelectedMark(stdItem)}
          </div>
        );
      })}
    </div>
  );
};
