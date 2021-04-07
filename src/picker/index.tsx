import React from 'react';
import clsx from 'clsx';
import { removeUnit } from '../utils';
import { BORDER_UNSET_TOP_BOTTOM } from '../utils/constant';
import { createBEM } from '../utils/bem';
import { i18n } from '../locale';
import { DEFAULT_ITEM_HEIGHT } from './constant';
import { PickerColumn } from './picker-column';
import { Loading } from '../loading';
import './index.scss';

export type ToolbarPosition = 'top' | 'bottom';

export type StandardColumnItem = {
  value: string;
  label: string;
};

export type ColumnItem = {
  [key: string]: string | string[] | ColumnItem[];
  value?: string;
  label?: string;
  children?: ColumnItem[];
};

export type PickerProps = {
  /** 可选项数据源 */
  columns?: string[] | string[][] | ColumnItem[] | ColumnItem[][];
  /** 默认的选中项 */
  defaultValue?: string | string[];
  /** 展示标题栏 */
  showToolbar?: boolean;
  /** 标题栏位置 */
  toolbarPosition?: ToolbarPosition;
  /** 标题文本 */
  title?: string;
  /** 取消按钮文本 */
  cancelButtonText?: string;
  /** 确定按钮文本 */
  confirmButtonText?: string;
  /** 行高 */
  itemHeight?: number;
  /** 窗口内可视行数 */
  visibleItemCount?: number;
  /** 自定义value的key值 */
  valueKey?: string;
  /** 自定义label的key值 */
  labelKey?: string;
  /** 滑动惯性滚动速度 */
  swipeDuration?: number;
  /** 加载中展示 */
  loading?: boolean;
  /** 自定义列样式 */
  columnClassName?: string;
  /** 不可选值 */
  disabledValue?: string[];
  /** 列数 */
  cols?: number;
  /** 是否联动 */
  cascade?: boolean;
  /** 选择取消后的回调 */
  onCancel?: (value: string[] | string) => void;
  /** 选择确定后的回调 */
  onConfirm?: (value: string[] | string) => void;
  closePopup?: (confirm?: boolean) => void;
  /** 点击后回调 */
  onChange?: (value: string[] | string) => void;
};

type PickerState = {
  formattedColumns: StandardColumnItem[][];
  children?: PickerColumn[];
  prevColumns?: string[] | string[][] | ColumnItem[] | ColumnItem[][];
  pickerValue?: string[];
};

const bem = createBEM('pant-picker');

// 生成formattedColumns
const getFormatted = (
  columns: string[] | string[][] | ColumnItem[] | ColumnItem[][],
  valueKey: string,
  labelKey: string,
  pickerValue: string[],
  cols: number,
  cascade: boolean,
): StandardColumnItem[][] => {
  const formatted: StandardColumnItem[][] = [];
  let filter = [...columns];

  // 多列非联动，columns类型为ColumnItem[][]
  if (cols > 1 && !cascade) {
    for (let i = 0; i < cols; i++) {
      if (filter[i] && filter[i].length) {
        const options: StandardColumnItem[] = [];
        (filter[i] as string[] | ColumnItem[]).forEach((item: string | ColumnItem) => {
          if (typeof item === 'string') {
            options.push({
              value: item,
              label: item,
            });
          } else {
            options.push({
              value: item[valueKey] as string,
              label: item[labelKey] as string,
            });
          }
        });
        formatted.push(options);
      } else {
        formatted.push([]);
      }
    }
    return formatted;
  }

  // 单列或多列联动，columns类型为ColumnItem[]
  for (let i = 0; i < cols; i++) {
    if (filter.length) {
      const options: StandardColumnItem[] = [];
      filter.forEach((item: string | ColumnItem) => {
        if (typeof item === 'string') {
          options.push({
            value: item,
            label: item,
          });
        } else {
          options.push({
            value: item[valueKey] as string,
            label: item[labelKey] as string,
          });
        }
      });
      formatted.push(options);
      if (i === cols - 1) {
        break;
      }

      // 当某一列的pickerValue为空时，默认展示pickerValue为0时的数据
      if (pickerValue[i] === undefined) {
        filter = (filter[0] as ColumnItem).children || [];
      } else {
        // 当存在item.value === pickerValue[i]时，展示该数据下的children；当不存在时，filter=[]
        filter = (filter as ColumnItem[]).filter((item) => item.value === pickerValue[i]);
        if (filter.length !== 0) {
          filter = (filter[0] as ColumnItem).children || [];
        }
      }
    } else {
      formatted.push([]);
    }
  }
  return formatted;
};

export class Picker extends React.Component<PickerProps, PickerState> {
  static defaultProps = {
    showToolbar: true,
    toolbarPosition: 'top',
    itemHeight: 44,
    visibleItemCount: 6,
    valueKey: 'value',
    labelKey: 'label',
    swipeDuration: 1000,
    loading: false,
    cols: 1,
    cascade: false,
  };

  private priChildren: PickerColumn[] = [];

  static getDerivedStateFromProps(nextProps: PickerProps, state: PickerState): PickerState {
    const { valueKey, columns, labelKey, cols, cascade } = nextProps;
    const { prevColumns } = state;
    if (columns !== prevColumns) {
      const defaultValue =
        typeof nextProps.defaultValue === 'string'
          ? nextProps.defaultValue
            ? [nextProps.defaultValue]
            : undefined
          : nextProps.defaultValue;
      const newPickerValue = defaultValue || [];
      const formattedColumns = getFormatted(columns, valueKey, labelKey, newPickerValue, cols, cascade);
      return {
        ...state,
        pickerValue: newPickerValue,
        formattedColumns: formattedColumns,
        prevColumns: columns,
      };
    } else {
      return null;
    }
  }

  constructor(props: PickerProps) {
    super(props);
    const defaultValue =
      typeof props.defaultValue === 'string'
        ? props.defaultValue
          ? [props.defaultValue]
          : undefined
        : props.defaultValue;
    this.state = {
      formattedColumns: [],
      children: [],
      prevColumns: [],
      pickerValue: defaultValue || [],
    };
    this.injectChildren = this.injectChildren.bind(this);
  }

  // 将pickerColumn实例注入到state.children
  injectChildren(children: PickerColumn): void {
    this.priChildren.push(children);
    if (this.state.children.length < this.priChildren.length) {
      this.setState({ children: this.priChildren });
    }
  }

  itemPxHeight(): number {
    const { itemHeight } = this.props;
    return itemHeight ? removeUnit(itemHeight) : DEFAULT_ITEM_HEIGHT;
  }

  genToolbar(): JSX.Element {
    const props = this.props;
    if (props.showToolbar) {
      return (
        <div className={bem('toolbar')}>
          {[
            <button key="cancel" type="button" className={bem('cancel')} onClick={this.cancel.bind(this)}>
              {props.cancelButtonText || i18n().cancel}
            </button>,
            <div key="title" className={clsx(bem('title'), 'pant-ellipsis')}>
              {props.title}
            </div>,
            <button key="confirm" type="button" className={bem('confirm')} onClick={this.confirm.bind(this)}>
              {props.confirmButtonText || i18n().confirm}
            </button>,
          ]}
        </div>
      );
    }
  }

  onCascadeChange(selectedIndex: number, columnIndex: number): void {
    const { formattedColumns, pickerValue } = this.state;
    const { valueKey, columns, cols, labelKey, cascade, onChange } = this.props;

    const newPickerValue: string[] = [];

    for (let i = 0; i < columnIndex; i++) {
      if (typeof pickerValue[i] === 'undefined') {
        newPickerValue[i] = formattedColumns[i][0].value;
      } else {
        newPickerValue[i] = pickerValue[i];
      }
    }
    newPickerValue[columnIndex] = formattedColumns[columnIndex][selectedIndex].value;
    const newFormattedColumns = getFormatted(columns, valueKey, labelKey, newPickerValue, cols, cascade);

    for (let i = columnIndex + 1; i < cols; i++) {
      newPickerValue[i] = newFormattedColumns[i][0] && newFormattedColumns[i][0].value;
    }

    this.setState({
      formattedColumns: newFormattedColumns,
      pickerValue: newPickerValue,
    });

    onChange && onChange(cols === 1 ? newPickerValue[0] : newPickerValue);
  }

  onChange(selectedIndex: number, columnIndex: number): void {
    const { cascade, cols, onChange } = this.props;
    const { formattedColumns, pickerValue } = this.state;

    if (cascade) {
      this.onCascadeChange(selectedIndex, columnIndex);
    } else {
      const newPickerValue = formattedColumns.map((column, i) => {
        if (i === columnIndex) {
          return column[selectedIndex].value;
        }

        if (typeof pickerValue[i] === 'undefined') {
          return column[0].value;
        }
        return pickerValue[i];
      });
      this.setState({
        pickerValue: newPickerValue,
      });
      onChange && onChange(cols === 1 ? newPickerValue[0] : newPickerValue);
    }
  }

  getValue(): string[] | string {
    const { cols } = this.props;
    const { pickerValue } = this.state;
    if (cols === 1) {
      return pickerValue[0];
    }
    return [...pickerValue];
  }

  confirm(): void {
    this.state.children.forEach((child: PickerColumn) => child.stopMomentum());
    const newPickerValue = [...this.state.pickerValue];
    this.state.formattedColumns.forEach((item: StandardColumnItem[], index: number) => {
      if (item && item.length) {
        if (typeof newPickerValue[index] === 'undefined') {
          newPickerValue[index] = item[0].value;
        }
      }
    });
    this.setState({ pickerValue: newPickerValue }, () => {
      this.emit('onConfirm');
      const { closePopup } = this.props;
      closePopup && closePopup(true);
    });
  }

  cancel(): void {
    this.emit('onCancel');
    const { closePopup } = this.props;
    closePopup && closePopup();
  }

  emit(event: 'onConfirm' | 'onCancel'): void {
    const { cols } = this.props;
    let newPickerValue: string[] | string = [...this.state.pickerValue];

    // 单列时，value返回string
    if (cols === 1) {
      newPickerValue = newPickerValue[0];
    }

    if (this.props[event]) {
      this.props[event](newPickerValue);
    }
  }

  genColumns(): JSX.Element {
    const props = this.props;
    const itemPxHeight = this.itemPxHeight();
    const wrapHeight = itemPxHeight * props.visibleItemCount;

    const frameStyle = { height: `${itemPxHeight}px` };
    const columnsStyle = { height: `${wrapHeight}px` };
    const maskStyle = {
      backgroundSize: `100% ${(wrapHeight - itemPxHeight) / 2}px`,
    };

    return (
      <div className={bem('columns')} style={columnsStyle}>
        {this.genColumnItems()}
        <div className={bem('mask')} style={maskStyle} />
        <div className={clsx(bem('frame'), BORDER_UNSET_TOP_BOTTOM)} style={frameStyle} />
      </div>
    );
  }

  genColumnItems(): JSX.Element[] {
    const { columnClassName, swipeDuration, disabledValue, visibleItemCount } = this.props;
    const { pickerValue, formattedColumns } = this.state;
    return formattedColumns.map((item, columnIndex) => (
      <PickerColumn
        key={columnIndex}
        value={pickerValue[columnIndex] || (item[0] && item[0].value)}
        disabledValue={disabledValue && disabledValue[columnIndex]}
        className={columnClassName}
        itemHeight={this.itemPxHeight()}
        swipeDuration={swipeDuration}
        visibleItemCount={visibleItemCount}
        options={item}
        onChange={(selectedIndex: number): void => {
          this.onChange(selectedIndex, columnIndex);
        }}
        injectChildren={this.injectChildren}
      />
    ));
  }

  render(): JSX.Element {
    const props = this.props;
    return (
      <div className={bem()}>
        {props.toolbarPosition === 'top' ? this.genToolbar() : null}
        {props.loading ? <Loading className={bem('loading')} /> : null}
        {this.genColumns()}
        {props.toolbarPosition === 'bottom' ? this.genToolbar() : null}
      </div>
    );
  }
}
