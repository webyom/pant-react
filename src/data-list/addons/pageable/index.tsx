import { useState } from 'react';
import { Button } from '../../../button';
import { Sticky } from '../../../sticky';
import { i18n } from '../../../locale';
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
  prevPageText?: string;
  nextPageText?: string;
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
  pageSize,
  recordCount,
  onPagingChange,
  ...props
}: PageableOptions & {
  dataListProps: DataListProps<any>;
  dataListRender: (props: DataListProps<any>) => JSX.Element;
}) {
  const [internalPaging, setInternalPaging] = useState<PagingQuery>({
    pageIndex: 1,
    pageSize: 20,
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
    <Pagination
      recordCount={recordCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPagingChange={onPagingChange}
      {...props}
    />
  );

  return (
    <>
      {dataListRender({
        ...dataListProps,
        records:
          records.length < recordCount ? records : records.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      })}
      {recordCount === 0 ? null : sticky ? (
        <Sticky container={stickyContainer} offsetTop={60} stickBottom>
          {pagination}
        </Sticky>
      ) : (
        pagination
      )}
    </>
  );
}

function Pagination({ recordCount, pageSize, pageIndex, prevPageText, nextPageText, onPagingChange }: PageableOptions) {
  const pages = Math.ceil(recordCount / pageSize);

  if (pages <= 1) {
    return null;
  }

  return (
    <div className="pant-data-list__pagination pant-hairline--top">
      <Button
        className="pant-data-list__pagination__prev"
        size="small"
        disabled={pageIndex === 1}
        onClick={() => onPagingChange({ pageSize, pageIndex: pageIndex - 1 })}
      >
        {prevPageText || i18n().prevPage}
      </Button>
      <span className="pant-data-list__pagination__text">
        {pageIndex} / {pages}
      </span>
      <Button
        className="pant-data-list__pagination__next"
        size="small"
        disabled={pageIndex >= pages}
        onClick={() => onPagingChange({ pageSize, pageIndex: pageIndex + 1 })}
      >
        {nextPageText || i18n().nextPage}
      </Button>
    </div>
  );
}
