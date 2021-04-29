import React, { useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Transition, TransitionEvents } from '../transition';
import { createBEM } from '../utils/bem';
import { addClass, removeClass } from '../utils/dom';
import { pantConfig } from '../';
import './index.scss';

export type OverlayProps = {
  show?: boolean;
  lockScroll?: boolean;
  zIndex?: number | string;
  duration?: number;
  className?: any;
  style?: Record<string, string>;
  onClick?(event: React.MouseEvent): void;
} & TransitionEvents;

const bem = createBEM('pant-overlay');

let count = 1;

export const Overlay: React.FC<OverlayProps> = (props) => {
  const countRef = useRef<number>();
  if (!countRef.current) {
    countRef.current = count++;
  }
  const style: Record<string, any> = {
    backgroundColor: pantConfig('defaultOverlayBgColor'),
    ...props.style,
    zIndex: props.zIndex,
  };

  if (props.duration > 0) {
    style.animationDuration = `${props.duration}s`;
  }

  useEffect(() => {
    if (props.lockScroll) {
      return () => removeClass(document.body, `pant-overflow-hidden-${countRef.current}`);
    }
  }, []);

  const onAfterEnter = useCallback(() => {
    props.lockScroll && addClass(document.body, `pant-overflow-hidden-${countRef.current}`);
    props.onAfterEnter && props.onAfterEnter();
  }, [props.onAfterEnter]);

  const onAfterLeave = useCallback(() => {
    props.lockScroll && removeClass(document.body, `pant-overflow-hidden-${countRef.current}`);
    props.onAfterLeave && props.onAfterLeave();
  }, [props.onAfterLeave]);

  return (
    <Transition
      name="fade"
      stage={props.show ? 'enter' : 'leave'}
      onAfterEnter={onAfterEnter}
      onAfterLeave={onAfterLeave}
    >
      <div style={style} className={clsx(bem(), props.className)} onClick={props.onClick}>
        {props.children}
      </div>
    </Transition>
  );
};

Overlay.defaultProps = {
  lockScroll: true,
};
