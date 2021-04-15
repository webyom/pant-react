import React from 'react';
import clsx from 'clsx';
import { Icon } from '../icon';
import { Loading } from '../loading';
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
  isLeaf?: string;
  children?: ColumnItem[];
};

export type ColumnItem = {
  [key: string]: any;
  value?: string;
  label?: string;
  isLeaf?: string;
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
  valueKey?: string;
  labelKey?: string;
  data?: ColumnItem[];
  defaultValue?: string[] | string[][];
  onCancel?: () => void;
  onConfirm?: (value: string[] | string[][]) => void;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: string[] | string) => void;
  onSelectionExceeds?: () => void;
  _popupId?: number;
};

type CascaderState = {
  pickerValue: string[][];
  currentValue: string[];
  contentWidth: number;
  backSteps: number;
  loading: boolean;
  data?: ColumnItem[];
};

const bem = createBEM('pant-cascader');

export class Cascader extends React.PureComponent<CascaderProps, CascaderState> {
  static defaultProps = {
    height: 360,
    columnWidth: 125,
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
      Array.isArray(props.defaultValue) && Array.isArray(props.defaultValue[0])
        ? props.defaultValue
        : Array.isArray(props.defaultValue) && typeof props.defaultValue[0] === 'string'
        ? [props.defaultValue]
        : undefined;
    this.state = {
      pickerValue: (defaultValue || []) as string[][],
      currentValue: [],
      contentWidth: 0,
      backSteps: 0,
      loading: false,
      data: props.data || [],
    };
    this.onPopupOpened = this.onPopupOpened.bind(this);
    this.setData = this.setData.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.backOneStep = this.backOneStep.bind(this);
    this.forwardOneStep = this.forwardOneStep.bind(this);
  }

  componentDidMount(): void {
    eventBus.on('popup.opened', this.onPopupOpened);
    if (!this.props._popupId) {
      this.setState({
        contentWidth: this.contentRef.current.clientWidth,
      });
    }
  }

  componentWillUnmount(): void {
    //
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
    this.setState({ pickerValue: [] }, cb);
  }

  setData(data: ColumnItem[]): void {
    this.setState({ data: data || [] });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
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
    const { closePopup, onConfirm } = this.props;
    onConfirm && onConfirm(this.getValue());
    closePopup && closePopup(true);
  }

  cancel(): void {
    const { closePopup, onCancel } = this.props;
    onCancel && onCancel();
    closePopup && closePopup();
  }

  normalizeItem(item: string | Record<string, any>): Record<string, any> {
    if (typeof item === 'string') {
      return {
        value: item,
        label: item,
      };
    }
    const { valueKey, labelKey } = this.props;
    return { ...item, value: item[valueKey] + '', label: item[labelKey] };
  }

  onClickItem(columnIndex: number, value: string): void {
    this.setState({ backSteps: 0, currentValue: [...this.state.currentValue.slice(0, columnIndex), value] });
  }

  getColumnWidth(): number {
    return Math.max(100, Math.min(this.props.columnWidth, 300));
  }

  getOffset(columns: number): number {
    const { contentWidth, backSteps } = this.state;
    if (!contentWidth) {
      return 0;
    }
    const columnWidth = this.getColumnWidth();
    return Math.min(0, contentWidth - columnWidth * (columns - backSteps));
  }

  getColumnItems(values: string[]): ColumnItem[] {
    let items = this.state.data;
    while (items && values.length) {
      const value = values.shift();
      const item = items.find((x) => x.value === value);
      items = item && item.children;
    }
    return items;
  }

  genColumns(): JSX.Element[] {
    const { data } = this.props;
    const { currentValue } = this.state;
    const columnWidth = this.getColumnWidth();
    const res = [];
    res.push(
      <CascaderColumn
        key="root"
        index={0}
        value={currentValue[0]}
        width={columnWidth}
        onClick={this.onClickItem.bind(this)}
        items={data}
      />,
    );
    for (let i = 0; i < currentValue.length; i++) {
      const items = this.getColumnItems(currentValue.slice(0, i + 1));
      if (!items || !items.length) {
        break;
      }
      res.push(
        <CascaderColumn
          key={currentValue[i]}
          index={i + 1}
          value={currentValue[i + 1]}
          width={columnWidth}
          onClick={this.onClickItem.bind(this)}
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
    const { contentWidth, loading, data, backSteps } = this.state;
    const columns = this.genColumns();
    const offset = this.getOffset(columns.length);

    return (
      <div className={bem()} style={{ height: _popupId ? 'auto' : height + 'px' }}>
        {this.genToolbar(true)}
        <div ref={this.contentRef} className={bem('content')}>
          <div className={bem('columns')} style={{ transform: `translateX(${offset}px)` }}>
            {columns}
          </div>
          {offset !== 0 && this.genBackBtn()}
          {backSteps !== 0 && this.genForwardBtn()}
        </div>
        {this.genToolbar()}
      </div>
    );
  }
}
