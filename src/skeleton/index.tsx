import React from 'react';
import { addUnit } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type SkeletonProps = {
  row?: number | string;
  title?: boolean;
  avatar?: boolean;
  loading?: boolean;
  animate?: boolean;
  avatarSize?: number | string;
  avatarShape?: 'square' | 'round';
  titleWidth?: number | string;
  rowWidth?: number | string | (number | string)[];
};

const DEFAULT_ROW_WIDTH = '100%';
const DEFAULT_LAST_ROW_WIDTH = '60%';

const bem = createBEM('pant-skeleton');

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  if (!props.loading) {
    return <React.Fragment>{props.children}</React.Fragment>;
  }

  function Title(): JSX.Element {
    if (props.title) {
      return <h3 className={bem('title')} style={{ width: addUnit(props.titleWidth) }} />;
    }
  }

  function Rows(): JSX.Element[] {
    const Rows = [];
    const { rowWidth } = props;

    function getRowWidth(index: number): number | string {
      if (rowWidth === DEFAULT_ROW_WIDTH && index === +props.row - 1) {
        return DEFAULT_LAST_ROW_WIDTH;
      }

      if (Array.isArray(rowWidth)) {
        return rowWidth[index];
      }

      return rowWidth;
    }

    for (let i = 0; i < props.row; i++) {
      Rows.push(<div key={i} className={bem('row')} style={{ width: addUnit(getRowWidth(i)) }} />);
    }

    return Rows;
  }

  function Avatar(): JSX.Element {
    if (props.avatar) {
      const size = addUnit(props.avatarSize);
      return <div className={bem('avatar', props.avatarShape)} style={{ width: size, height: size }} />;
    }
  }

  return (
    <div className={bem({ animate: props.animate })}>
      {Avatar()}
      <div className={bem('content')}>
        {Title()}
        {Rows()}
      </div>
    </div>
  );
};

Skeleton.defaultProps = {
  row: 0,
  loading: true,
  animate: true,
  avatarSize: '32px',
  avatarShape: 'round',
  titleWidth: '40%',
  rowWidth: DEFAULT_ROW_WIDTH,
};
