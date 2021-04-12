import { Icon } from '../../../icon';
import { Button } from '../../../button';
import { DataListAddon, DataListProps } from '../..';

export type SortableOptions = Record<string, any>;

export function sortable(options: SortableOptions = {}): DataListAddon {
  return {
    onInjectToolbox: (render) => (props) => {
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

function Sortable(props: SortableOptions) {
  return (
    <div>
      <Button size="small">
        排序
        <Icon name="sort" />
      </Button>
    </div>
  );
}
