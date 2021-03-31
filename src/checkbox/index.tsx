import React from 'react';
import { Icon } from '../icon';
import { addUnit } from '../utils';
import { createBEM } from '../utils/bem';
import './index.scss';

export type CheckboxRole = 'checkbox' | 'radio';

export type CheckboxBaseProps = {
  name?: string;
  disabled?: boolean;
  iconSize?: number | string;
  checkedColor?: string;
  labelPosition?: 'left' | 'right';
  labelDisabled?: boolean;
  shape?: 'square' | 'round';
  direction?: 'horizontal' | 'vertical';
  iconNode?: React.ReactNode;
  activeIconNode?: React.ReactNode;
  inactiveIconNode?: React.ReactNode;
};

export type CheckboxProps = CheckboxBaseProps & {
  value?: string;
  checked?: boolean;
  role?: CheckboxRole;
  children?: React.ReactNode;
  onClick?(event: React.MouseEvent, props: CheckboxProps): void;
};

const bem = createBEM('pant-checkbox');

export const Checkbox: React.FC<CheckboxProps> = props => {
  function iconStyle(): Record<string, string> {
    const checkedColor = props.checkedColor;

    if (checkedColor && props.checked && !props.disabled) {
      return {
        borderColor: checkedColor,
        backgroundColor: checkedColor,
      };
    }
  }

  function onClick(event: React.MouseEvent): void {
    if (props.disabled) {
      return;
    }
    if (props.role == 'radio' && props.checked) {
      return;
    }
    props.onClick && props.onClick(event, props);
  }

  function genIcon(): JSX.Element {
    const { checked, iconSize } = props;

    return (
      <div
        key="icon"
        className={bem('icon', [props.shape, { disabled: props.disabled, checked }])}
        style={{ fontSize: addUnit(iconSize) }}
        onClick={props.labelDisabled ? onClick : null}
      >
        {(checked && props.activeIconNode) || (!checked && props.inactiveIconNode) || props.iconNode || (
          <Icon name="success" style={iconStyle()} />
        )}
      </div>
    );
  }

  function genLabel(): JSX.Element {
    if (props.children) {
      return (
        <span key="label" className={bem('label', [props.labelPosition, { disabled: props.disabled }])}>
          {props.children}
        </span>
      );
    }
  }

  function tabindex(): number {
    if (props.disabled || (props.role === 'radio' && !props.checked)) {
      return -1;
    }

    return 0;
  }

  const Children = [genIcon()];

  if (props.labelPosition === 'left') {
    Children.unshift(genLabel());
  } else {
    Children.push(genLabel());
  }

  return (
    <div
      role={props.role}
      className={bem([
        {
          disabled: props.disabled,
          'label-disabled': props.labelDisabled,
        },
        props.direction,
      ])}
      tabIndex={tabindex()}
      aria-checked={props.checked}
      onClick={props.labelDisabled ? null : onClick}
    >
      {Children}
    </div>
  );
};

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  labelPosition: 'right',
  role: 'checkbox',
  shape: 'round',
  direction: 'vertical',
};
