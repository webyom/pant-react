import { Sticky } from '../../../sticky';
import { DataListAddon, DataListProps } from '../..';
import { useMiddleware } from '../../use-middleware';

export type ToolboxOptions = {
  sticky?: boolean;
  stickyContainer?: React.RefObject<HTMLElement>;
};

export function toolbox(options: ToolboxOptions = {}): DataListAddon {
  return {
    onInjectDataList: (render) => (props) => {
      return <DataListToolbox dataListProps={props} dataListRender={render} {...options} />;
    },
  };
}

function DataListToolbox({
  dataListRender,
  dataListProps,
  sticky,
  stickyContainer,
}: ToolboxOptions & {
  dataListProps: DataListProps;
  dataListRender: (props: DataListProps) => JSX.Element;
}) {
  const toolbox = <Toolbox {...dataListProps} />;

  return (
    <>
      {sticky ? (
        <Sticky container={stickyContainer} offsetBottom={50}>
          {toolbox}
        </Sticky>
      ) : (
        toolbox
      )}
      {dataListRender({
        ...dataListProps,
      })}
    </>
  );
}

function Toolbox(props: DataListProps) {
  const addons = props.addons;
  const renderToolbox = useMiddleware(addons, 'onInjectToolbox')((props) => <></>);
  return <div className="pant-data-list__toolbox">{renderToolbox(props)}</div>;
}
