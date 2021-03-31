import React from 'react';
import clsx from 'clsx';
import { Icon } from '../icon';
import { isDef } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type CellProps = {
  title?: React.ReactNode;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'large';
  border?: boolean;
  center?: boolean;
  required?: boolean;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  onClick?(event: React.MouseEvent): void;
};

const bem = createBEM('pant-cell');

export const Cell: React.FC<CellProps> = props => {
  const { icon, title, label, rightIcon } = props;
  const showTitle = isDef(title);

  function Label(): JSX.Element {
    if (isDef(label)) {
      return <div className={bem('label')}>{label}</div>;
    }
  }

  function Title(): JSX.Element {
    if (showTitle) {
      return (
        <div className={clsx(bem('title'), props.titleClassName)}>
          {typeof title === 'string' ? <span>{title}</span> : title}
          {Label()}
        </div>
      );
    }
  }

  function Value(): JSX.Element {
    if (isDef(props.children)) {
      return <div className={clsx(bem('value', { alone: !showTitle }), props.valueClassName)}>{props.children}</div>;
    }
  }

  function LeftIcon(): React.ReactNode {
    if (typeof icon === 'string') {
      return <Icon className={bem('left-icon')} name={icon} />;
    } else if (icon) {
      return icon;
    }
  }

  function RightIcon(): React.ReactNode {
    if (typeof rightIcon === 'string') {
      return <Icon className={bem('right-icon')} name={rightIcon} />;
    } else if (rightIcon) {
      return rightIcon;
    }
  }

  function onClick(event: React.MouseEvent): void {
    props.onClick && props.onClick(event);
  }

  const clickable = !!props.onClick;

  const classes: Record<string, string | boolean> = {
    clickable,
    large: props.size === 'large',
    center: props.center,
    required: props.required,
    borderless: !props.border,
  };

  return (
    <div
      className={clsx(bem(classes), props.className)}
      role={clickable ? 'button' : null}
      tabIndex={clickable ? 0 : null}
      onClick={onClick}
    >
      {LeftIcon()}
      {Title()}
      {Value()}
      {RightIcon()}
    </div>
  );
};

Cell.defaultProps = {
  border: true,
};
