import React from 'react';
import { Popup } from '../../popup';
import { DatetimePicker } from '../../datetime-picker';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-datetime-picker');

type DatetimePickerRouteState = {
  dateValue: Date;
  showPopup: boolean;
};

export class DatetimePickerRouteComponent extends React.PureComponent<any, DatetimePickerRouteState> {
  state: DatetimePickerRouteState = {
    dateValue: new Date(),
    showPopup: false,
  };

  onClick(): void {
    this.setState({
      showPopup: true,
    });
  }

  onConfirm(value: Date): void {
    this.setState({
      dateValue: value,
      showPopup: false,
    });
  }

  onCancel(): void {
    this.setState({
      showPopup: false,
    });
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="DatetimePicker" type="datetime-picker" />
        <div className={bem()}>
          <section>
            <h2>Choose Date</h2>
            <div className={bem('card')}>
              <DatetimePicker type="date" title="Choose Date" defaultValue={new Date()} />
            </div>
          </section>

          <section>
            <h2>Choose Time</h2>
            <div className={bem('card')}>
              <DatetimePicker type="time" title="Choose Time" defaultValue={new Date()} />
            </div>
          </section>

          <section>
            <h2>With Seconds</h2>
            <div className={bem('card')}>
              <DatetimePicker type="time" title="With Seconds" defaultValue={new Date()} seconds />
            </div>
          </section>

          <section>
            <h2>Choose DateTime</h2>
            <div className={bem('card')}>
              <DatetimePicker type="datetime" title="Choose DateTime" defaultValue={new Date()} seconds />
            </div>
          </section>

          <section>
            <h2>Formatter</h2>
            <div className={bem('card')}>
              <DatetimePicker
                type="datetime"
                title="Formatter"
                prefixZero={false}
                defaultValue={new Date()}
                seconds
                formatter={(text, type) => {
                  if ((type === 'mm' || type === 's') && parseInt(text) < 10) {
                    text = '0' + text;
                  }
                  return text + { y: '年', m: '月', d: '日', h: '时', mm: '分', s: '秒' }[type];
                }}
              />
            </div>
          </section>

          <section>
            <h2>With Popup</h2>
            <div className={bem('popup-input')} onClick={this.onClick.bind(this)}>
              <span>Date</span>
              <span>{this.state.dateValue && this.state.dateValue.toLocaleDateString()}</span>
            </div>
          </section>

          <Popup show={this.state.showPopup} round position="bottom" onClickClose={this.onCancel.bind(this)}>
            <DatetimePicker
              type="date"
              title="Choose Date"
              defaultValue={this.state.dateValue}
              onCancel={this.onCancel.bind(this)}
              onConfirm={this.onConfirm.bind(this)}
            />
          </Popup>
        </div>
      </React.Fragment>
    );
  }
}
