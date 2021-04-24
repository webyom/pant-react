import React from 'react';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import { Popup } from '../../popup';
import { SearchablePicker, LoadParams, LoadResult } from '..';
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

  onLoad(params: LoadParams): Promise<LoadResult> {
    const { text, offset, limit, loadMore } = params;
    const newText = text.trim();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!newText) {
          if (loadMore) {
            resolve({ data: data.slice(offset, offset + limit), total: data.length, params });
          } else {
            resolve({ data: data.slice(0, 20), total: data.length, params });
          }
        } else {
          const resData = data.filter((item) => item.indexOf(newText) >= 0);
          resolve({ data: resData, total: resData.length, params });
        }
      }, 1000 + 500 * Math.random());
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
            <h2>On Load</h2>
            <div className={bem('card')}>
              <SearchablePicker title="On Load" onChange={this.onChange} onLoad={this.onLoad.bind(this)} />
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
                onLoad={this.onLoad.bind(this)}
                searchable={false}
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
                onLoad={this.onLoad.bind(this)}
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
