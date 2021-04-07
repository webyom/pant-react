import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Transition, TransitionEvents } from '../transition';
import { createBEM } from '../utils/bem';
import { preventDefaultAndStopPropagation } from '../utils/event';
import { pantConfig } from '../';
import './index.scss';

export type OverlayProps = {
  show?: boolean;
  lockScroll?: boolean;
  zIndex?: number | string;
  duration?: number;
  className?: any;
  style?: Record<string, string | number>;
  onClick?(event: React.MouseEvent): void;
} & TransitionEvents;

const bem = createBEM('pant-overlay');

export const Overlay: React.FC<OverlayProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>();
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
      const onTouchMove = (event: Event) => {
        preventDefaultAndStopPropagation(event);
      };
      containerRef.current.addEventListener('touchmove', onTouchMove, false);
      return () => containerRef.current.removeEventListener('touchmove', onTouchMove, false);
    }
  }, []);

  return (
    <Transition
      name="fade"
      stage={props.show ? 'enter' : 'leave'}
      onAfterEnter={props.onAfterEnter}
      onAfterLeave={props.onAfterLeave}
    >
      <div ref={containerRef} style={style} className={clsx(bem(), props.className)} onClick={props.onClick}>
        {props.children}
      </div>
    </Transition>
  );
};

Overlay.defaultProps = {
  lockScroll: true,
};
