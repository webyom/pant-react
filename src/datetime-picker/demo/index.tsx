import React from 'react';
import { DatetimePicker } from '../../datetime-picker';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-datetime-picker');

export class DatetimePickerRouteComponent extends React.Component {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="DatetimePicker" type="datetime-picker" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <div className={bem('card')}>
              <DatetimePicker
                type="datetime"
                title="Select Datetime"
                prefixZero={false}
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
        </div>
      </React.Fragment>
    );
  }
}
