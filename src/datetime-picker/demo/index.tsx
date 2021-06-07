import React from 'react';
import { Popup } from '../../popup';
import { DatetimePicker, DatetimeRange } from '../../datetime-picker';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-datetime-picker');

type DatetimePickerRouteState = {
  dateValue: Date;
  showPopup: boolean;
  rangeValue: Date[];
  showRange: boolean;
};

export class DatetimePickerRouteComponent extends React.PureComponent<any, DatetimePickerRouteState> {
  state: DatetimePickerRouteState = {
    dateValue: new Date(),
    showPopup: false,
    rangeValue: [new Date(), new Date()],
    showRange: false,
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
              <DatetimePicker type="yearmonth" title="Choose Date" />
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
            <div className={bem('popup-input')} onClick={() => this.setState({ showPopup: true })}>
              <span>Date</span>
              <span>{this.state.dateValue && this.state.dateValue.toLocaleDateString()}</span>
            </div>
            <Popup
              show={this.state.showPopup}
              round
              position="bottom"
              onClickClose={() => this.setState({ showPopup: false })}
            >
              <DatetimePicker
                type="date"
                title="Choose Date"
                defaultValue={this.state.dateValue}
                onCancel={() => this.setState({ showPopup: false })}
                onConfirm={(value: Date) => this.setState({ dateValue: value, showPopup: false })}
              />
            </Popup>
          </section>

          <section>
            <h2>Datetime Range</h2>
            <div className={bem('popup-input')} onClick={() => this.setState({ showRange: true })}>
              <span>Range</span>
              <span>
                {this.state.rangeValue &&
                  this.state.rangeValue[0].toLocaleString() + ' ~ ' + this.state.rangeValue[1].toLocaleString()}
              </span>
            </div>
            <DatetimeRange
              show={this.state.showRange}
              type="datetime"
              defaultValue={this.state.rangeValue}
              onCancel={() => this.setState({ showRange: false })}
              onConfirm={(value: [Date, Date]) => this.setState({ rangeValue: value, showRange: false })}
            />
          </section>
        </div>
      </React.Fragment>
    );
  }
}
