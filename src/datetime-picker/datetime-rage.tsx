import React from 'react';
import { PickerProps } from '../picker';
import { Popup } from '../popup';
import { i18n } from '../locale';
import { DatetimePicker } from '.';
import { createBEM } from '../utils/bem';
import './index.scss';

export type DatetimeRangeProps = Pick<PickerProps, 'showToolbar' | 'toolbarPosition'> & {
  show?: boolean;
  type: 'date' | 'datetime' | 'time';
  seconds?: boolean;
  min?: Date;
  max?: Date;
  defaultValue?: Date;
  titleStart?: string;
  titleEnd?: string;
  prefixZero?: boolean;
  seperator?: boolean;
  formatter?: (text: string, type: 'y' | 'm' | 'd' | 'h' | 'mm' | 's') => string;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: Date) => void;
};

type DatetimeRangeState = {
  step: number;
  startDate?: Date;
  endDate?: Date;
};

const bem = createBEM('pant-datetime-range');

export class DatetimeRange extends React.PureComponent<DatetimeRangeProps, DatetimeRangeState> {
  static readonly __FIELD_BEHAVIOR__ = 'Popup';
  static defaultProps = {
    titleStart: i18n().selectStartDate,
    titleEnd: i18n().selectEndDate,
  };

  constructor(props: DatetimeRangeProps) {
    super(props);
    this.state = {
      step: 1,
    };
    this.closePopup = this.closePopup.bind(this);
    this.onConfirm1 = this.onConfirm1.bind(this);
    this.onConfirm2 = this.onConfirm2.bind(this);
  }

  getValue(): [Date, Date] {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate) {
      return null;
    }
    return [startDate, endDate];
  }

  closePopup(confirm: boolean): void {
    const { closePopup } = this.props;
    if (!confirm) {
      this.setState({ step: 1 }, () => {
        closePopup && closePopup();
      });
    }
  }

  onConfirm1(date: Date): void {
    this.setState({ step: 2, startDate: date });
  }

  onConfirm2(date: Date): void {
    const { closePopup } = this.props;
    this.setState({ step: 1, endDate: date }, () => {
      closePopup && closePopup(true);
    });
  }

  render(): JSX.Element {
    const {
      show,
      type,
      seconds,
      min,
      max,
      titleStart,
      titleEnd,
      prefixZero,
      seperator,
      formatter,
      toolbarPosition,
    } = this.props;
    const { step, startDate, endDate } = this.state;
    return (
      <div className={bem([type, { seconds, seperator }])}>
        <Popup round position="bottom" show={show && step === 1} closePopup={this.closePopup} closeOnClickOverlay>
          <DatetimePicker
            title={titleStart}
            type={type}
            seconds={seconds}
            min={min}
            max={max}
            prefixZero={prefixZero}
            seperator={seperator}
            formatter={formatter}
            toolbarPosition={toolbarPosition}
            onConfirm={this.onConfirm1}
          />
        </Popup>
        <Popup round position="bottom" show={show && step === 2} closePopup={this.closePopup} closeOnClickOverlay>
          <DatetimePicker
            key={Date.now()}
            title={titleEnd}
            type={type}
            seconds={seconds}
            min={startDate || min}
            max={max}
            prefixZero={prefixZero}
            seperator={seperator}
            formatter={formatter}
            toolbarPosition={toolbarPosition}
            onConfirm={this.onConfirm2}
            defaultValue={endDate}
          />
        </Popup>
      </div>
    );
  }
}
