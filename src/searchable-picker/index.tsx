import React from 'react';
import clsx from 'clsx';
import { debounce } from 'lodash-es';
import { InfiniteLoader, List, ListRowProps } from 'react-virtualized'; /* eslint-disable-line */
import { toast } from '../toast';
import { Icon } from '../icon';
import { Loading } from '../loading';
import { PopupToolbar } from '../popup/toolbar';
import { Search } from '../search';
import { i18n } from '../locale';
import { interpolate, addUnit } from '../utils';
import { eventBus } from '../utils/event-bus';
import { createBEM } from '../utils/bem';
import './index.scss';

export type DataItem = string | Record<string, any>;

export type DataSet = DataItem[];

export type LoadParams = {
  text: string;
  offset: number;
  limit: number;
  prevData: DataSet;
  loadMore?: boolean;
};

export type LoadResult = {
  data: DataSet;
  total: number;
  params: LoadParams;
};

export type SearchablePickerProps = {
  title?: string;
  height?: number | string;
  rowHeight?: number;
  maxSelection?: number;
  firstLoadLimit?: number;
  searchable?: boolean;
  fullscreen?: boolean;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  cancelButtonText?: string;
  confirmButtonText?: string;
  valueKey?: string;
  labelKey?: string;
  data?: DataSet;
  defaultValue?: string | string[];
  checkedNode?: React.ReactNode;
  uncheckedNode?: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: (value: string[] | string) => void;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: string[] | string) => void;
  onLoad?: (params: LoadParams) => Promise<LoadResult>;
  onSelectionExceeds?: () => void;
  rowRenderer?: (
    rowProps: ListRowProps & { selected: boolean; item: Record<string, any>; select(index: number): void },
  ) => JSX.Element;
  _popupId?: number;
};

type SearchablePickerState = {
  pickerValue: string[];
  contentWidth: number;
  contentHeight: number;
  searchText: string;
  loading: boolean;
  data: DataSet;
  total: number;
  prevProps: SearchablePickerProps;
};

const bem = createBEM('pant-searchable-picker');

export class SearchablePicker extends React.PureComponent<SearchablePickerProps, SearchablePickerState> {
  static defaultProps = {
    height: 300,
    rowHeight: 36,
    maxSelection: 1,
    firstLoadLimit: 20,
    searchable: true,
    showToolbar: true,
    toolbarPosition: 'top',
    valueKey: 'value',
    labelKey: 'label',
    data: [] as DataSet,
  };

  private contentRef = React.createRef<HTMLDivElement>();
  private listInstance: List;

  constructor(props: SearchablePickerProps) {
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
      searchText: '',
      loading: false,
      data: props.data || [],
      total: props.data?.length ?? 0,
      prevProps: props,
    };
    this.select = this.select.bind(this);
    this.setLoadResult = this.setLoadResult.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.onSearchChange = debounce(this.onSearchChange.bind(this), 500);
    this.onPopupOpened = this.onPopupOpened.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.isRowLoaded = this.isRowLoaded.bind(this);
    this.loadMoreRows = this.loadMoreRows.bind(this);
  }

  static getDerivedStateFromProps(props: SearchablePickerProps, state: SearchablePickerState): SearchablePickerState {
    const { prevProps } = state;
    if (props.data !== prevProps.data) {
      return { ...state, data: props.data || [], prevProps: props };
    }
    return null;
  }

  componentDidMount(): void {
    eventBus.on('popup.opened', this.onPopupOpened);
    const { _popupId, data, onLoad, firstLoadLimit } = this.props;
    if (!_popupId) {
      this.setState({
        contentWidth: this.contentRef.current.clientWidth,
        contentHeight: this.contentRef.current.clientHeight,
      });
    }

    if (onLoad) {
      this.showLoading();
      onLoad({ text: '', prevData: [...data], offset: 0, limit: firstLoadLimit })
        .then(this.setLoadResult)
        .finally(this.hideLoading);
    }
  }

  componentWillUnmount(): void {
    eventBus.off('popup.opened', this.onPopupOpened);
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
    this.setState({ pickerValue: [] }, () => {
      this.listInstance.forceUpdateGrid();
      cb();
    });
  }

  setLoadResult(res: LoadResult): void {
    const {
      data,
      total,
      params: { loadMore, offset, limit },
    } = res;
    let newData = data || [];
    if (loadMore) {
      const { data: prevData } = this.state;
      const len = prevData.length;
      if (len < offset) {
        newData = [...prevData, ...new Array(offset - len).fill(null), ...data];
      } else {
        newData = [...prevData.slice(0, offset), ...data];
        if (len > offset + limit) {
          newData = [...newData, ...prevData.slice(offset + limit)];
        }
      }
    }
    this.setState({ data: newData, total, loading: false });
  }

  showLoading(): void {
    this.setState({ loading: true });
  }

  hideLoading(): void {
    this.setState({ loading: false });
  }

  onSearchChange(text: string): void {
    const { onLoad, firstLoadLimit } = this.props;
    const { data } = this.state;
    if (onLoad) {
      this.setState({ searchText: text }, () => {
        this.showLoading();
        onLoad({ text, prevData: [...data], offset: 0, limit: firstLoadLimit })
          .then(this.setLoadResult)
          .finally(this.hideLoading);
      });
    } else {
      let data: DataSet;
      if (!text) {
        data = this.props.data;
      } else {
        text = text.toLocaleLowerCase();
        data = this.props.data.filter((item) => {
          item = this.normalizeItem(item);
          if (item.label.toLowerCase().indexOf(text) >= 0) {
            return true;
          } else {
            if (item.label === item.value) {
              return false;
            } else if (item.value.toLowerCase().indexOf(text) >= 0) {
              return true;
            }
          }
        });
      }
      this.setState({ data, total: data.length, searchText: text });
    }
  }

  onPopupOpened(id: number): void {
    if (id === this.props._popupId) {
      this.setState({ contentWidth: this.contentRef.current.clientWidth });
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
      this.listInstance.forceUpdateGrid();
      onChange && onChange(this.getValue());
    });
  }

  rowRenderer(rowProps: ListRowProps): JSX.Element {
    const {
      key, // Unique key within array of rows
      index, // Index of row within collection
      style, // Style object to be applied to row (to position it)
    } = rowProps;
    const { data, pickerValue } = this.state;
    const rawItem = data[index];
    if (!rawItem) {
      return <div key={key} style={style} className={bem('item')}></div>;
    }
    const item = this.normalizeItem(rawItem);
    const selected = pickerValue.indexOf(item.value) >= 0;
    const { rowRenderer, checkedNode, uncheckedNode } = this.props;
    if (rowRenderer) {
      return rowRenderer({ ...rowProps, selected, item, select: this.select });
    }
    return (
      <div key={key} style={style} className={bem('item', { selected })} onClick={() => this.select(index)}>
        <span>{item.label}</span>
        {selected ? (
          checkedNode !== undefined ? (
            checkedNode
          ) : (
            <Icon name="passed" />
          )
        ) : uncheckedNode !== undefined ? (
          uncheckedNode
        ) : (
          <Icon name="circle" />
        )}
      </div>
    );
  }

  isRowLoaded({ index }: { index: number }): boolean {
    const { data } = this.state;
    return !!data[index];
  }

  loadMoreRows({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }): Promise<any> {
    const { onLoad } = this.props;
    const { data, searchText } = this.state;
    if (!onLoad) {
      return;
    }
    this.setState({ loading: true });
    return onLoad({
      text: searchText,
      offset: startIndex,
      limit: stopIndex - startIndex + 1,
      prevData: data,
      loadMore: true,
    })
      .then(this.setLoadResult)
      .finally(this.hideLoading);
  }

  render(): JSX.Element {
    const { _popupId, height, rowHeight, fullscreen, searchable } = this.props;
    const { contentWidth, contentHeight, loading, data, total } = this.state;
    return (
      <div
        className={bem({ fullscreen: fullscreen })}
        style={{ height: fullscreen ? '100%' : _popupId ? 'auto' : addUnit(height) }}
      >
        {this.genToolbar(true)}
        {searchable ? (
          <Search onChange={this.onSearchChange} icon={loading ? <Loading size={16} /> : undefined} />
        ) : null}
        <div className={bem('content-wrapper')}>
          <div ref={this.contentRef} className={bem('content')}>
            {data.length ? (
              <InfiniteLoader isRowLoaded={this.isRowLoaded} loadMoreRows={this.loadMoreRows} rowCount={total}>
                {({ onRowsRendered, registerChild }) => (
                  <List
                    ref={(list) => {
                      this.listInstance = list;
                      registerChild(list);
                    }}
                    onRowsRendered={onRowsRendered}
                    width={contentWidth}
                    height={contentHeight}
                    rowCount={total}
                    rowHeight={rowHeight}
                    rowRenderer={this.rowRenderer}
                  />
                )}
              </InfiniteLoader>
            ) : loading ? null : (
              <div className={bem('msg')}>{i18n().noData}</div>
            )}
          </div>
        </div>
        {this.genToolbar()}
      </div>
    );
  }
}
