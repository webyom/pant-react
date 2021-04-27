import React from 'react';
import { Icon } from '../../../icon';
import { Popup } from '../../../popup';
import { PopupToolbar } from '../../../popup/toolbar';
import { createBEM } from '../../../utils/bem';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';
import './index.scss';

type SortOrder = 'desc' | 'asc';

export type SortableColumn = {
  key: string;
  header: React.ReactNode;
  prefer?: SortOrder;
};

export type SortBy = {
  by: string;
  order: SortOrder;
};

export type SortableOptions = {
  columns: SortableColumn[];
  value?: SortBy[];
  multiple?: boolean;
  sortButton?: JSX.Element;
  ascIcon?: JSX.Element;
  descIcon?: JSX.Element;
  sortIcon?: JSX.Element;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onChange: (value: SortBy[]) => void;
};

export function sortable(options: SortableOptions): DataListAddon {
  return {
    onInjectToolbar: (render) => (props) => {
      return (
        <>
          {render(props)}
          <Sortable {...options} />
        </>
      );
    },
  };
}

const bem = createBEM('pant-data-list__sort');

type SortableState = {
  show: boolean;
  value?: SortBy[];
  prevProps: SortableOptions;
};

export class Sortable extends React.PureComponent<SortableOptions, SortableState> {
  static defaultProps = {
    value: [] as SortBy[],
  };

  constructor(props: React.PropsWithChildren<SortableOptions>) {
    super(props);
    this.state = {
      show: false,
      value: props.value,
      prevProps: props,
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.confirm = this.confirm.bind(this);
  }

  static getDerivedStateFromProps(
    props: React.PropsWithChildren<SortableOptions>,
    state: SortableState,
  ): SortableState {
    const { prevProps } = state;
    if (prevProps.value !== props.value) {
      return {
        ...state,
        value: props.value,
        prevProps: props,
      };
    } else {
      return null;
    }
  }

  show(): void {
    this.setState({ show: true });
  }

  hide(): void {
    this.setState({ show: false, value: this.props.value });
  }

  confirm(): void {
    const value = [...this.state.value];
    this.setState({ show: false, value: this.props.value }, () => {
      const onChange = this.props.onChange;
      onChange && onChange(value);
    });
  }

  sort(by: string, prefer: SortOrder = 'desc', order?: string): void {
    let newItem: SortBy;
    if (order === prefer) {
      if (prefer === 'desc') {
        newItem = { by, order: 'asc' };
      } else {
        newItem = { by, order: 'desc' };
      }
    } else if (!order) {
      newItem = { by, order: prefer };
    }

    let value: SortBy[];
    if (this.props.multiple === false) {
      value = [];
    } else {
      value = this.state.value.filter((v) => v.by !== by);
    }

    if (newItem) {
      value.push(newItem);
    }

    this.setState({ value });
  }

  render(): JSX.Element {
    const { columns, sortButton, ascIcon, descIcon, sortIcon, cancelButtonText, confirmButtonText } = this.props;
    const { show, value = [] } = this.state;
    return (
      <>
        <div className={bem()} onClick={this.show}>
          {sortButton || (
            <>
              <span>{i18n().sorting}</span>
              <Icon name="sort" />
            </>
          )}
        </div>
        <Popup className={bem('popup')} show={show} position="top" onClickClose={this.hide}>
          <>
            <div className={bem('list')}>
              {columns.map(({ key, prefer, header }) => {
                const sortBy = value.find((v) => v.by === key);
                const order = sortBy?.order;
                return (
                  <div className={bem('item')} key={key} onClick={() => this.sort(key, prefer, order)}>
                    <div className={bem('by')}>{header}</div>
                    <div className={bem('order', { empty: !order })}>
                      {order === 'desc' && descIcon ? (
                        descIcon
                      ) : order === 'asc' && ascIcon ? (
                        ascIcon
                      ) : sortIcon ? (
                        sortIcon
                      ) : (
                        <Icon name={order === 'desc' ? 'descending' : order === 'asc' ? 'ascending' : 'sort'} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <PopupToolbar
              className={bem('footer')}
              onCancel={this.hide}
              onConfirm={this.confirm}
              cancelButtonText={cancelButtonText}
              confirmButtonText={confirmButtonText}
            />
          </>
        </Popup>
      </>
    );
  }
}
