import { useState } from 'react';
import { Icon } from '../../../icon';
import { Popup } from '../../../popup';
import { PopupToolbar } from '../../../popup/toolbar';
import { createBEM } from '../../../utils/bem';
import { i18n } from '../../../locale';
import { DataListAddon, DataListProps } from '../..';
import './index.scss';

export type FilterableOptions = Record<string, any>;

export function filterable(options: FilterableOptions = {}): DataListAddon {
  return {
    onInjectToolbar: (render) => (props) => {
      return <DataListFilterable dataListProps={props} dataListRender={render} {...options} />;
    },
  };
}

function DataListFilterable({
  dataListRender,
  dataListProps,
}: FilterableOptions & {
  dataListProps: DataListProps;
  dataListRender: (props: DataListProps) => JSX.Element;
}) {
  return (
    <>
      {dataListRender({
        ...dataListProps,
      })}
      <Filterable />
    </>
  );
}

const bem = createBEM('pant-data-list__filter');

function Filterable(props: FilterableOptions) {
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);

  return (
    <>
      <div className={bem()} onClick={toggle}>
        <span>{i18n().filter}</span>
        <Icon name="filter-o" />
      </div>
      <Popup show={show} position="bottom" onClickClose={toggle} round>
        <>
          <PopupToolbar title={i18n().filter} />
          <div className={bem('list')}></div>
          <PopupToolbar onCancel={() => 1} onConfirm={() => 1} />
        </>
      </Popup>
    </>
  );
}
