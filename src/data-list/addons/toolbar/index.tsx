import { Sticky } from '../../../sticky';
import { DataListAddon, DataListProps } from '../..';
import { useMiddleware } from '../../use-middleware';
import './index.scss';

export type ToolbarOptions = {
  sticky?: boolean;
  stickyContainer?: React.RefObject<HTMLElement>;
};

export function toolbar(options: ToolbarOptions = {}): DataListAddon {
  return {
    onInjectDataList: (render) => (props) => {
      return <DataListToolbar dataListProps={props} dataListRender={render} {...options} />;
    },
  };
}

function DataListToolbar({
  dataListRender,
  dataListProps,
  sticky,
  stickyContainer,
}: ToolbarOptions & {
  dataListProps: DataListProps;
  dataListRender: (props: DataListProps) => JSX.Element;
}) {
  const toolbar = <Toolbar {...dataListProps} />;

  return (
    <>
      {sticky ? (
        <Sticky container={stickyContainer} offsetBottom={60}>
          {toolbar}
        </Sticky>
      ) : (
        toolbar
      )}
      {dataListRender({
        ...dataListProps,
      })}
    </>
  );
}

function Toolbar(props: DataListProps) {
  const addons = props.addons;
  const renderToolbar = useMiddleware(addons, 'onInjectToolbar')(() => <></>);
  return <div className="pant-data-list__toolbar pant-hairline--bottom">{renderToolbar(props)}</div>;
}
