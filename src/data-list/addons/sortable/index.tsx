import { useState } from 'react';
import { Icon } from '../../../icon';
import { Popup } from '../../../popup';
import { PopupToolbar } from '../../../popup/toolbar';
import { createBEM } from '../../../utils/bem';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';
import './index.scss';

export type SortableColumn<T = Record<string, any>> = {
  key: string;
  prefer?: 'desc' | 'asc';
  sorter?: (first: T, second: T) => number;
};

export type SortBy<T = Record<string, any>> = {
  by: string;
  order: 'desc' | 'asc';
  sorter?: (first: T, second: T) => number;
};

export type SortableOptions = {
  columns: SortableColumn[];
  value?: SortBy[];
  onChange?: (value: SortBy[]) => void;
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

function Sortable(props: SortableOptions) {
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);

  return (
    <>
      <div className={bem()} onClick={toggle}>
        <span>{i18n().sorting}</span>
        <Icon name="sort" />
      </div>
      <Popup show={show} position="bottom" onClickClose={toggle} round>
        <>
          <PopupToolbar title={i18n().sorting} onCancel={() => 1} onConfirm={() => 1} />
          <div className={bem('list')}></div>
        </>
      </Popup>
    </>
  );
}
