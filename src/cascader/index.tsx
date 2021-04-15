import React from 'react';
import clsx from 'clsx';
import { Icon } from '../icon';
import { Loading } from '../loading';
import { PopupToolbar } from '../popup/toolbar';
import { i18n } from '../locale';
import { interpolate } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type StandardColumnItem = {
  value: string;
  label: string;
};

export type ColumnItem = {
  [key: string]: any;
  value?: string;
  label?: string;
  children?: ColumnItem[];
};

type DataItem = string | Record<string, any>;
type DataSet = DataItem[];

export type OnSearchOptions = {
  setData(data: DataSet): void;
  setLoading(loading: boolean): void;
};

export type CascaderProps = {
  title?: string;
  height?: number;
  rowHeight?: number;
  maxSelection?: number;
  fullscreen?: boolean;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  cancelButtonText?: string;
  confirmButtonText?: string;
  valueKey?: string;
  labelKey?: string;
  data?: DataSet;
  defaultValue?: string | string[];
  onCancel?: () => void;
  onConfirm?: (value: string[] | string) => void;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: string[] | string) => void;
  onSearch?: (text: string, opt: OnSearchOptions) => void;
  onSelectionExceeds?: () => void;
  _popupId?: number;
};

type CascaderState = {
  pickerValue: string[];
  contentWidth: number;
  contentHeight: number;
  loading: boolean;
  data?: DataSet;
};

const bem = createBEM('pant-cascader');

export class Cascader extends React.PureComponent<CascaderProps, CascaderState> {
  static defaultProps = {
    height: 360,
    rowHeight: 36,
    maxSelection: 1,
    showToolbar: true,
    toolbarPosition: 'top',
    valueKey: 'value',
    labelKey: 'label',
    data: [] as DataSet,
  };

  private contentRef = React.createRef<HTMLDivElement>();

  constructor(props: CascaderProps) {
    super(props);
    const defaultValue =
      typeof props.defaultValue === 'string'
        ? props.defaultValue
          ? [props.defaultValue]
          : undefined
        : props.defaultValue;
    this.state = {
      pickerValue: defaultValue || [],
      contentWidth: 0,
      contentHeight: 0,
      loading: false,
      data: props.data || [],
    };
    this.setData = this.setData.bind(this);
    this.setLoading = this.setLoading.bind(this);
  }

  componentDidMount(): void {
    //
  }

  componentWillUnmount(): void {
    //
  }

  getValue(): string[] | string {
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

  setData(data: DataSet): void {
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

  render(): JSX.Element {
    const { _popupId, height, rowHeight, fullscreen } = this.props;
    const { contentWidth, contentHeight, loading, data } = this.state;
    return (
      <div className={bem()} style={{ height: _popupId ? 'auto' : height + 'px' }}>
        {this.genToolbar(true)}
        <div ref={this.contentRef} className={bem('content')}></div>
        {this.genToolbar()}
      </div>
    );
  }
}
