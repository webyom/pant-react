import React from 'react';
import * as CSS from 'csstype';
import { Icon } from '../icon';
import { Button, ButtonType } from '../button';
import { i18n } from '../locale';
import { createBEM } from '../utils/bem';
import './index.scss';

export type SubmitBarProps = {
  tip?: string;
  tipIcon?: string;
  label?: string;
  price?: number;
  loading?: boolean;
  currency?: string;
  disabled?: boolean;
  buttonType?: ButtonType;
  buttonText?: string;
  suffixLabel?: string;
  decimalLength?: number;
  safeAreaInsetBottom?: boolean;
  textAlign?: CSS.Property.TextAlign;
  tipNode?: React.ReactNode;
  topNode?: React.ReactNode;
  children?: React.ReactNode;
  onSubmit?(): void;
};

const bem = createBEM('pant-submit-bar');

export const SubmitBar: React.FC<SubmitBarProps> = (props) => {
  const { tip, price, tipIcon } = props;

  function Text(): JSX.Element {
    if (typeof price === 'number') {
      const priceArr = (price / 100).toFixed(props.decimalLength).split('.');
      const decimalStr = props.decimalLength ? `.${priceArr[1]}` : '';
      return (
        <div style={{ textAlign: props.textAlign ? props.textAlign : undefined }} className={bem('text')}>
          <span>{props.label}</span>
          <span className={bem('price')}>
            {props.currency}
            <span className={bem('price', 'integer')}>{priceArr[0]}</span>
            {decimalStr}
          </span>
          {props.suffixLabel && <span className={bem('suffix-label')}>{props.suffixLabel}</span>}
        </div>
      );
    }
  }

  function Tip(): JSX.Element {
    if (props.tip || props.tipNode) {
      return (
        <div className={bem('tip')}>
          {tipIcon && <Icon className={bem('tip-icon')} name={tipIcon} />}
          {tip && <span className={bem('tip-text')}>{tip}</span>}
          {props.tipNode}
        </div>
      );
    }
  }

  return (
    <div className={bem({ 'safe-area-inset-bottom': props.safeAreaInsetBottom })}>
      {props.topNode}
      {Tip()}
      <div className={bem('bar')}>
        {props.children}
        {Text()}
        <Button
          round
          className={bem('button', props.buttonType)}
          type={props.buttonType}
          loading={props.loading}
          disabled={props.disabled}
          text={props.loading ? '' : props.buttonText || i18n().submit}
          onClick={props.onSubmit}
        />
      </div>
    </div>
  );
};

SubmitBar.defaultProps = {
  decimalLength: 2,
  currency: '¥',
  buttonType: 'danger',
};
