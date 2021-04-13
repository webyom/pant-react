import { useState } from 'react';
import { Icon } from '../../../icon';
import { Popup } from '../../../popup';
import { PopupToolbar } from '../../../popup/toolbar';
import { createBEM } from '../../../utils/bem';
import { i18n } from '../../../locale';
import { DataListAddon, DataListProps } from '../..';
import './index.scss';

export type SortableOptions = Record<string, any>;

export function sortable(options: SortableOptions = {}): DataListAddon {
  return {
    onInjectToolbar: (render) => (props) => {
      return <DataListSortable dataListProps={props} dataListRender={render} {...options} />;
    },
  };
}

function DataListSortable({
  dataListRender,
  dataListProps,
}: SortableOptions & {
  dataListProps: DataListProps;
  dataListRender: (props: DataListProps) => JSX.Element;
}) {
  return (
    <>
      {dataListRender({
        ...dataListProps,
      })}
      <Sortable />
    </>
  );
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