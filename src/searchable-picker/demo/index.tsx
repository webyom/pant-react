import React from 'react';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import { Popup } from '../../popup';
import { SearchablePicker, DataSet } from '..';
import { toast } from '../../toast';
import { data } from './constant';
import './index.scss';

const bem = createBEM('demo-searchable-picker');

type SearchablePickerState = {
  cityValue: string[];
  showPicker1: boolean;
  showPicker2: boolean;
};

export class SearchablePickerRouteComponent extends React.PureComponent<any, SearchablePickerState> {
  state: SearchablePickerState = {
    cityValue: ['河北省保定市'],
    showPicker1: false,
    showPicker2: false,
  };

  onChange<T extends string | string[]>(value: T): void {
    value &&
      toast({
        message: `${value}`,
      });
  }

  onSearch(text: string): Promise<DataSet> {
    text = text.trim();
    if (!text) {
      return Promise.resolve(data);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data.filter((item) => item.indexOf(text) >= 0));
      }, 1000);
    });
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="SearchablePicker" type="searchable-picker" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <div className={bem('card')}>
              <SearchablePicker title="Basic Usage" data={data} onChange={this.onChange} />
            </div>
          </section>

          <section>
            <h2>On Search</h2>
            <div className={bem('card')}>
              <SearchablePicker title="On Search" onChange={this.onChange} onSearch={this.onSearch.bind(this)} />
            </div>
          </section>

          <section>
            <h2>With Popup</h2>
            <div
              className={bem('cityinput')}
              onClick={() => {
                this.setState({
                  showPicker1: true,
                });
              }}
            >
              <span>City</span>
              <span>{this.state.cityValue.join(', ')}</span>
            </div>
            <Popup
              show={this.state.showPicker1}
              position="bottom"
              onClickClose={(): void => {
                this.setState({
                  showPicker1: false,
                });
              }}
              round
            >
              <SearchablePicker
                title="With Popup"
                data={data}
                defaultValue={this.state.cityValue}
                maxSelection={2}
                onSearch={this.onSearch.bind(this)}
                onCancel={(): void => {
                  this.setState({
                    showPicker1: false,
                  });
                }}
                onConfirm={(value: string[]): void => {
                  this.setState({
                    cityValue: value,
                    showPicker1: false,
                  });
                }}
              />
            </Popup>
          </section>

          <section>
            <h2>Full Screen</h2>
            <div
              className={bem('cityinput')}
              onClick={() => {
                this.setState({
                  showPicker2: true,
                });
              }}
            >
              <span>City</span>
              <span>{this.state.cityValue.join(', ')}</span>
            </div>
            <Popup
              show={this.state.showPicker2}
              position="bottom"
              onClickClose={(): void => {
                this.setState({
                  showPicker2: false,
                });
              }}
              style={{ height: '100%' }}
            >
              <SearchablePicker
                title="Full Screen"
                data={data}
                defaultValue={this.state.cityValue}
                maxSelection={2}
                toolbarPosition="bottom"
                fullscreen
                onSearch={this.onSearch.bind(this)}
                onCancel={(): void => {
                  this.setState({
                    showPicker2: false,
                  });
                }}
                onConfirm={(value: string[]): void => {
                  this.setState({
                    cityValue: value,
                    showPicker2: false,
                  });
                }}
              />
            </Popup>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
