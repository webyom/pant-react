import React from 'react';
import clsx from 'clsx';
import { debounce } from 'lodash-es';
import { List, ListRowProps } from 'react-virtualized'; /* eslint-disable-line */
import { toast } from '../toast';
import { Icon } from '../icon';
import { Loading } from '../loading';
import { Search } from '../search';
import { i18n } from '../locale';
import { interpolate } from '../utils';
import { eventBus } from '../utils/event-bus';
import { stopPropagation } from '../utils/event';
import { createBEM } from '../utils/bem';
import './index.scss';

type DataItem = string | Record<string, any>;
type DataSet = DataItem[];

export type OnSearchOptions = {
  setData(data: DataSet): void;
  setLoading(loading: boolean): void;
};

export type SearchPickerProps = {
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
  rowRenderer?: (
    rowProps: ListRowProps & { selected: boolean; item: Record<string, any>; select(index: number): void },
  ) => JSX.Element;
  _popupId?: number;
};

type SearchPickerState = {
  pickerValue: string[];
  contentWidth: number;
  contentHeight: number;
  loading: boolean;
  data?: DataSet;
};

const bem = createBEM('pant-search-picker');

export class SearchPicker extends React.PureComponent<SearchPickerProps, SearchPickerState> {
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
  private listRef = React.createRef<List>();

  constructor(props: SearchPickerProps) {
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
    this.select = this.select.bind(this);
    this.setData = this.setData.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.onSearchChange = debounce(this.onSearchChange.bind(this), 500);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onPopupOpened = this.onPopupOpened.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
  }

  componentDidMount(): void {
    eventBus.on('popup.opened', this.onPopupOpened);
    const { _popupId, onSearch } = this.props;
    if (!_popupId) {
      this.setState({
        contentWidth: this.contentRef.current.clientWidth - 24,
        contentHeight: this.contentRef.current.clientHeight,
      });
    }
    this.contentRef.current.addEventListener('touchmove', this.onTouchMove, false);
    onSearch && onSearch('', { setData: this.setData, setLoading: this.setLoading });
  }

  componentWillUnmount(): void {
    eventBus.off('popup.opened', this.onPopupOpened);
    this.contentRef.current.removeEventListener('touchmove', this.onTouchMove, false);
  }

  getValue(): string[] | string {
    const { maxSelection } = this.props;
    const { pickerValue } = this.state;
    if (maxSelection === 1) {
      return pickerValue[0];
    }
    return [...pickerValue];
  }

  setData(data: DataSet): void {
    this.setState({ data: data || [] });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  onSearchChange(text: string): void {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(text, { setData: this.setData, setLoading: this.setLoading });
    } else {
      let data: DataSet;
      if (!text) {
        data = this.props.data;
      } else {
        data = this.props.data.filter((item) => {
          item = this.normalizeItem(item);
          if (item.label.indexOf(text) >= 0) {
            return true;
          } else {
            if (item.label === item.value) {
              return false;
            } else if (item.value.indexOf(text) >= 0) {
              return true;
            }
          }
        });
      }
      this.setState({ data });
    }
  }

  onTouchMove(event: Event): void {
    stopPropagation(event);
  }

  onPopupOpened(id: number): void {
    if (id === this.props._popupId) {
      this.setState({ contentWidth: this.contentRef.current.clientWidth - 24 });
      this.setState({ contentHeight: this.contentRef.current.clientHeight });
    }
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
    } else {
      if (top) {
        if (props.title) {
          return (
            <div className={bem('toolbar', { title: true })}>
              <div key="title" className={clsx(bem('title'), 'pant-ellipsis')}>
                {props.title}
              </div>
            </div>
          );
        }
      } else {
        return (
          <div className={bem('toolbar')}>
            {[
              <button key="cancel" type="button" className={bem('cancel')} onClick={this.cancel.bind(this)}>
                {props.cancelButtonText || i18n().cancel}
              </button>,
              <button key="confirm" type="button" className={bem('confirm')} onClick={this.confirm.bind(this)}>
                {props.confirmButtonText || i18n().confirm}
              </button>,
            ]}
          </div>
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

  select(index: number): void {
    const { maxSelection, onChange, onSelectionExceeds } = this.props;
    const { pickerValue, data } = this.state;
    const item = this.normalizeItem(data[index]);
    let newPickerValue: string[];
    if (pickerValue.indexOf(item.value) >= 0) {
      if (maxSelection <= 1) {
        newPickerValue = [];
      } else {
        newPickerValue = pickerValue.filter((val) => val !== item.value);
      }
    } else {
      if (maxSelection <= 1) {
        newPickerValue = [item.value];
      } else if (pickerValue.length < maxSelection) {
        newPickerValue = [...pickerValue, item.value];
      } else {
        newPickerValue = pickerValue;
        if (onSelectionExceeds) {
          onSelectionExceeds();
        } else {
          toast(interpolate(i18n().maxSelection, [maxSelection]));
        }
        return;
      }
    }
    this.setState({ pickerValue: newPickerValue }, () => {
      this.listRef.current.forceUpdateGrid();
      onChange && onChange(this.getValue());
    });
  }

  rowRenderer(rowProps: ListRowProps): JSX.Element {
    const {
      key, // Unique key within array of rows
      index, // Index of row within collection
      style, // Style object to be applied to row (to position it)
    } = rowProps;
    const item = this.normalizeItem(this.state.data[index]);
    const selected = this.state.pickerValue.indexOf(item.value) >= 0;
    if (this.props.rowRenderer) {
      return this.props.rowRenderer({ ...rowProps, selected, item, select: this.select });
    }
    return (
      <div key={key} style={style} className={bem('item', { selected })} onClick={() => this.select(index)}>
        <span>{item.label}</span>
        {selected ? <Icon name="passed" /> : <Icon name="circle" />}
      </div>
    );
  }

  render(): JSX.Element {
    const { _popupId, height, rowHeight, fullscreen } = this.props;
    const { contentWidth, contentHeight, loading, data } = this.state;
    return (
      <div
        className={bem({ fullscreen: fullscreen })}
        style={{ height: fullscreen ? '100%' : _popupId ? 'auto' : height + 'px' }}
      >
        {this.genToolbar(true)}
        <Search onChange={this.onSearchChange} icon={loading ? <Loading size={16} /> : undefined} />
        <div ref={this.contentRef} className={bem('content')}>
          {data.length ? (
            <List
              ref={this.listRef}
              width={contentWidth}
              height={contentHeight}
              rowCount={data.length}
              rowHeight={rowHeight}
              rowRenderer={this.rowRenderer}
            />
          ) : (
            <div className={bem('msg')}>{i18n().noData}</div>
          )}
        </div>
        {this.genToolbar()}
      </div>
    );
  }
}
