import React from 'react';
import clsx from 'clsx';
import { get } from 'lodash-es';
import { Icon } from '../icon';
import { Loading } from '../loading';
import { toast } from '../toast';
import { PopupToolbar } from '../popup/toolbar';
import { i18n } from '../locale';
import { eventBus } from '../utils/event-bus';
import { interpolate } from '../utils';
import { createBEM } from '../utils/bem';
import { CascaderColumn } from './cascader-column';
import './index.scss';

export type StandardColumnItem = {
  value: string;
  label: string;
  children?: ColumnItem[];
};

export type ColumnItem = {
  [key: string]: any;
  value?: string;
  label?: string;
  children?: ColumnItem[];
};

export type CascaderProps = {
  title?: string;
  height?: number;
  columnWidth?: number;
  maxSelection?: number;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  cancelButtonText?: string;
  confirmButtonText?: string;
  valueKey?: string | string[];
  labelKey?: string | string[];
  data?: ColumnItem[];
  defaultValue?: string[] | string[][];
  checkedNode?: React.ReactNode;
  uncheckedNode?: React.ReactNode;
  onLoad?: (value: string[]) => Promise<ColumnItem[]>;
  onCancel?: () => void;
  onConfirm?: (value: string[] | string[][]) => void;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: string[] | string[][]) => void;
  onSelectionExceeds?: () => void;
  _popupId?: number;
};

type CascaderState = {
  pickerValue: string[][];
  rollbackPickerValue: string[][];
  currentValue: string[];
  rollbackCurrentValue: string[];
  contentWidth: number;
  backSteps: number;
  loading: boolean;
  data?: ColumnItem[];
  prevProps: CascaderProps;
};

const bem = createBEM('pant-cascader');

const MIN_COLUMN_WIDTH = 100;
const MAX_COLUMN_WIDTH = 300;
const LAST_COLUMN_EXTRA_WIDTH = 30;

export class Cascader extends React.PureComponent<CascaderProps, CascaderState> {
  static defaultProps = {
    height: 300,
    columnWidth: 140,
    maxSelection: 1,
    showToolbar: true,
    toolbarPosition: 'top',
    valueKey: 'value',
    labelKey: 'label',
    data: [] as ColumnItem[],
  };

  private contentRef = React.createRef<HTMLDivElement>();

  constructor(props: CascaderProps) {
    super(props);
    const defaultValue =
      (Array.isArray(props.defaultValue) && Array.isArray(props.defaultValue[0])
        ? props.defaultValue
        : Array.isArray(props.defaultValue) && typeof props.defaultValue[0] === 'string'
        ? [props.defaultValue]
        : undefined) || [];
    const currentValue = defaultValue.length ? (defaultValue[0].slice(0, -1) as string[]) : [];
    this.state = {
      pickerValue: [...defaultValue] as string[][],
      rollbackPickerValue: [...defaultValue] as string[][],
      currentValue: [...currentValue],
      rollbackCurrentValue: [...currentValue],
      contentWidth: 0,
      backSteps: 0,
      loading: false,
      data: props.data || [],
      prevProps: props,
    };
    this.onPopupOpened = this.onPopupOpened.bind(this);
    this.isItemSelected = this.isItemSelected.bind(this);
    this.hasChildrenSelected = this.hasChildrenSelected.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.backOneStep = this.backOneStep.bind(this);
    this.forwardOneStep = this.forwardOneStep.bind(this);
    this.normalizeItem = this.normalizeItem.bind(this);
  }

  static getDerivedStateFromProps(props: CascaderProps, state: CascaderState): CascaderState {
    const { prevProps } = state;
    if (props.data !== prevProps.data) {
      return { ...state, data: props.data || [], prevProps: props };
    }
    return null;
  }

  componentDidMount(): void {
    const { _popupId, data, onLoad } = this.props;
    eventBus.on('popup.opened', this.onPopupOpened);
    if (!_popupId) {
      this.setState({
        contentWidth: this.contentRef.current.clientWidth,
      });
    }

    if (onLoad && !data.length) {
      this.showLoading();
      onLoad([])
        .then((data) => {
          this.setState({ data: data || [] });
        })
        .finally(this.hideLoading);
    }
  }

  componentWillUnmount(): void {
    eventBus.off('popup.opened', this.onPopupOpened);
  }

  onPopupOpened(id: number): void {
    if (id === this.props._popupId) {
      this.setState({ contentWidth: this.contentRef.current.clientWidth });
    }
  }

  getValue(): string[] | string[][] {
    const { maxSelection } = this.props;
    const { pickerValue } = this.state;
    if (maxSelection === 1) {
      return pickerValue[0];
    }
    return [...pickerValue];
  }

  clearValue(cb: () => void): void {
    this.setState({ pickerValue: [], rollbackPickerValue: [] }, cb);
  }

  showLoading(): void {
    this.setState({ loading: true });
  }

  hideLoading(): void {
    this.setState({ loading: false });
  }

  genToolbar(top?: boolean): JSX.Element {
    const props = this.props;
    if (!props.showToolbar) {
      if (!props.title || !top) {
        return;
      }

      if (top) {
        return (
          <div className={bem('toolbar', { title: true })}>
            <div key="title" className={clsx(bem('title'), 'pant-ellipsis')}>
              {props.title}
            </div>
          </div>
        );
      }
    }

    if (props.toolbarPosition === 'top') {
      if (top) {
        return (
          <PopupToolbar
            title={props.title}
            cancelButtonText={props.cancelButtonText || i18n().cancel}
            confirmButtonText={props.confirmButtonText || i18n().confirm}
            onCancel={this.cancel.bind(this)}
            onConfirm={this.confirm.bind(this)}
          />
        );
      }
    } else {
      if (top) {
        if (props.title) {
          return <PopupToolbar title={props.title} />;
        }
      } else {
        return (
          <PopupToolbar
            cancelButtonText={props.cancelButtonText || i18n().cancel}
            confirmButtonText={props.confirmButtonText || i18n().confirm}
            onCancel={this.cancel.bind(this)}
            onConfirm={this.confirm.bind(this)}
          />
        );
      }
    }
  }

  confirm(): void {
    const { pickerValue, currentValue } = this.state;
    this.setState({ rollbackPickerValue: [...pickerValue], rollbackCurrentValue: [...currentValue] }, () => {
      const { closePopup, onConfirm } = this.props;
      onConfirm && onConfirm(this.getValue());
      closePopup && closePopup(true);
    });
  }

  cancel(): void {
    const { rollbackPickerValue, rollbackCurrentValue } = this.state;
    this.setState({ pickerValue: [...rollbackPickerValue], currentValue: [...rollbackCurrentValue] }, () => {
      const { closePopup, onCancel } = this.props;
      onCancel && onCancel();
      closePopup && closePopup();
    });
  }

  normalizeItem(item: ColumnItem): StandardColumnItem {
    const { valueKey, labelKey } = this.props;
    const value = get(item, valueKey, '') + '';
    return { ...item, value, label: get(item, labelKey, value) };
  }

  isSameValue(a: string[], b: string[]): boolean {
    if (!a || !b) {
      return false;
    }
    return a.length === b.length && a.every((item) => b.includes(item));
  }

  isContainValue(a: string[], b: string[]): boolean {
    if (!a || !b) {
      return false;
    }
    return a.every((item) => b.includes(item));
  }

  isItemSelected(columnIndex: number, item: StandardColumnItem): boolean {
    const { currentValue, pickerValue } = this.state;
    const targetValue = [...currentValue.slice(0, columnIndex), item.value];
    return pickerValue.some((value) => this.isSameValue(targetValue, value));
  }

  hasChildrenSelected(columnIndex: number, item: StandardColumnItem): boolean {
    const { currentValue, pickerValue } = this.state;
    const targetValue = [...currentValue.slice(0, columnIndex), item.value];
    return pickerValue.some((value) => this.isContainValue(targetValue, value));
  }

  onClickItem(columnIndex: number, item: StandardColumnItem): void {
    const { maxSelection, onChange, onLoad } = this.props;
    const { currentValue, pickerValue, data } = this.state;
    const newValue = [...currentValue.slice(0, columnIndex), item.value];
    if (item.children) {
      if (!item.children.length && onLoad) {
        this.showLoading();
        onLoad([...newValue])
          .then((items) => {
            let res = data;
            let item: ColumnItem;
            const value = [...newValue];
            while (res && value.length) {
              const v = value.shift();
              item = res.find((item) => this.normalizeItem(item).value === v);
              res = item && item.children;
            }
            item.children = items;
            this.setState({ data, backSteps: 0, currentValue: newValue });
          })
          .finally(this.hideLoading);
      } else {
        this.setState({ backSteps: 0, currentValue: newValue });
      }
    } else {
      let newPickerValue: string[][];
      if (maxSelection === 1) {
        if (this.isSameValue(pickerValue[0], newValue)) {
          newPickerValue = [];
        } else {
          newPickerValue = [newValue];
        }
      } else {
        newPickerValue = pickerValue.filter((value) => !this.isSameValue(value, newValue));
        if (newPickerValue.length === pickerValue.length) {
          if (pickerValue.length >= maxSelection) {
            toast(interpolate(i18n().maxSelection, [maxSelection]));
            return;
          } else {
            newPickerValue = [...pickerValue, newValue];
          }
        }
      }
      this.setState({ pickerValue: newPickerValue }, () => {
        onChange && onChange(this.getValue());
      });
    }
  }

  getColumnWidth(): number {
    return Math.max(MIN_COLUMN_WIDTH, Math.min(this.props.columnWidth, MAX_COLUMN_WIDTH));
  }

  getOffset(columns: number): number {
    const { contentWidth, backSteps } = this.state;
    if (!contentWidth) {
      return 0;
    }
    const columnWidth = this.getColumnWidth();
    return Math.min(
      0,
      contentWidth - columnWidth * (columns - backSteps) - (backSteps > 0 ? 0 : LAST_COLUMN_EXTRA_WIDTH),
    );
  }

  getColumnItems(values: string[]): ColumnItem[] {
    let items = this.state.data;
    while (items && values.length) {
      const value = values.shift();
      const item = items.find((item) => this.normalizeItem(item).value === value);
      items = item && item.children;
    }
    return items;
  }

  genColumns(): JSX.Element[] {
    const { maxSelection, checkedNode, uncheckedNode } = this.props;
    const { data, currentValue, contentWidth } = this.state;
    const len = currentValue.length;
    const columnWidth = this.getColumnWidth();
    const res = [];
    res.push(
      <CascaderColumn
        key="root"
        maxSelection={maxSelection}
        index={0}
        value={currentValue[0]}
        width={len ? columnWidth : contentWidth}
        checkedNode={checkedNode}
        uncheckedNode={uncheckedNode}
        isItemSelected={this.isItemSelected}
        hasChildrenSelected={this.hasChildrenSelected}
        normalizeItem={this.normalizeItem}
        onClick={this.onClickItem}
        items={data}
      />,
    );
    for (let i = 0; i < len; i++) {
      const items = this.getColumnItems(currentValue.slice(0, i + 1));
      if (!items || !items.length) {
        break;
      }
      let width;
      if (i === len - 1) {
        const extra = contentWidth - (len + 1) * columnWidth - LAST_COLUMN_EXTRA_WIDTH;
        width = columnWidth + LAST_COLUMN_EXTRA_WIDTH + Math.max(extra, 0);
      } else {
        width = columnWidth;
      }
      res.push(
        <CascaderColumn
          key={currentValue[i]}
          maxSelection={maxSelection}
          index={i + 1}
          value={currentValue[i + 1]}
          width={width}
          checkedNode={checkedNode}
          uncheckedNode={uncheckedNode}
          isItemSelected={this.isItemSelected}
          hasChildrenSelected={this.hasChildrenSelected}
          normalizeItem={this.normalizeItem}
          onClick={this.onClickItem}
          items={items}
        />,
      );
    }
    return res;
  }

  backOneStep(): void {
    this.setState({ backSteps: this.state.backSteps + 1 });
  }

  forwardOneStep(): void {
    const backSteps = this.state.backSteps;
    if (backSteps > 0) {
      this.setState({ backSteps: backSteps - 1 });
    }
  }

  genBackBtn(): JSX.Element {
    return (
      <div className={bem('back')} onClick={this.backOneStep}>
        <Icon name="arrow-left" />
      </div>
    );
  }

  genForwardBtn(): JSX.Element {
    return (
      <div className={bem('forward')} onClick={this.forwardOneStep}>
        <Icon name="arrow" />
      </div>
    );
  }

  render(): JSX.Element {
    const { _popupId, height } = this.props;
    const { loading, backSteps } = this.state;
    const columns = this.genColumns();
    const offset = this.getOffset(columns.length);

    return (
      <div className={bem()} style={{ height: _popupId ? 'auto' : height + 'px' }}>
        {this.genToolbar(true)}
        <div ref={this.contentRef} className={bem('content')}>
          <div className={bem('columns')} style={{ transform: `translateX(${offset}px)` }}>
            {columns}
          </div>
          {loading ? <Loading size="30" /> : null}
          {offset !== 0 && this.genBackBtn()}
          {backSteps !== 0 && this.genForwardBtn()}
        </div>
        {this.genToolbar()}
      </div>
    );
  }
}
