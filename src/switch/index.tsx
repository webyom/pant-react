import React from 'react';
import { Loading } from '../loading';
import { addUnit } from '../utils';
import { createBEM } from '../utils/bem';
import { BLUE } from '../utils/constant';
import './index.scss';

export type SwitchProps = {
  name?: string;
  on?: boolean;
  size?: string | number;
  value?: any;
  loading?: boolean;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  style?: Record<string, string | number>;
  onClick?(event: React.MouseEvent, props: SwitchProps): void;
};

const bem = createBEM('pant-switch');

export const Switch: React.FC<SwitchProps> = (props) => {
  const { on, loading, disabled } = props;

  const style = {
    ...props.style,
    fontSize: addUnit(props.size),
    backgroundColor: on ? props.activeColor : props.inactiveColor,
  };

  function onClick(event: React.MouseEvent): void {
    if (loading || disabled) {
      return;
    }
    props.onClick && props.onClick(event, props);
  }

  function genLoading(): JSX.Element {
    if (props.loading) {
      const color = on ? props.activeColor || BLUE : props.inactiveColor || '';

      return <Loading className={bem('loading')} color={color} />;
    }
  }

  return (
    <div
      className={bem({
        on: on,
        loading,
        disabled,
      })}
      role="switch"
      style={style}
      aria-checked={!!on}
      onClick={onClick}
    >
      <div className={bem('node')}>{genLoading()}</div>
    </div>
  );
};
