import { useState } from 'react';
import { Button } from '../../../button';
import { Sticky } from '../../../sticky';
import { DataListAddon, DataListProps } from '../..';
import './index.scss';

export type PagingQuery = {
  pageIndex?: number;
  pageSize?: number;
};

export type PageableOptions = {
  sticky?: boolean;
  stickyContainer?: React.RefObject<HTMLElement>;
  pageIndex?: number;
  pageSize?: number;
  recordCount?: number;
  onPagingChange?: (query: PagingQuery) => void;
};

export function pageable(options: PageableOptions = {}): DataListAddon {
  return {
    onInjectDataList: (render) => (props) => {
      const { records } = props;
      const { recordCount = records.length, ...paginationProps } = options;
      return (
        <DataListPagination
          dataListProps={props}
          dataListRender={render}
          {...paginationProps}
          recordCount={recordCount}
        />
      );
    },
  };
}

function DataListPagination({
  dataListRender,
  dataListProps,
  sticky,
  stickyContainer,
  pageIndex,
  pageSize = 20,
  recordCount,
  onPagingChange,
}: PageableOptions & {
  dataListProps: DataListProps<any>;
  dataListRender: (props: DataListProps<any>) => JSX.Element;
}) {
  const [internalPaging, setInternalPaging] = useState<PagingQuery>({
    pageIndex: 1,
    pageSize: pageSize,
  });

  if (typeof pageIndex === 'undefined') {
    pageIndex = internalPaging.pageIndex;
  }

  if (typeof pageSize === 'undefined') {
    pageSize = internalPaging.pageSize;
  }

  onPagingChange = ((onPagingChange) => (query: PagingQuery) => {
    setInternalPaging(query);
    onPagingChange && onPagingChange(query);
  })(onPagingChange);

  const { records } = dataListProps;
  const pagination = (
    <Pagination recordCount={recordCount} pageIndex={pageIndex} pageSize={pageSize} onPagingChange={onPagingChange} />
  );

  return (
    <>
      {dataListRender({
        ...dataListProps,
        records:
          records.length < recordCount ? records : records.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      })}
      {sticky ? (
        <Sticky container={stickyContainer} offsetTop={60} stickBottom>
          {pagination}
        </Sticky>
      ) : (
        pagination
      )}
    </>
  );
}

function Pagination(props: PageableOptions) {
  return (
    <div className="pant-data-list__pagination pant-hairline--top">
      <Button size="small">上一页</Button>
      <span>1 / 5</span>
      <Button size="small">下一页</Button>
    </div>
  );
}
