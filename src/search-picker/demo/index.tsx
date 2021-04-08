import React from 'react';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import { Popup } from '../../popup';
import { SearchPicker } from '../../search-picker';
import { toast } from '../../toast';
import './index.scss';

const bem = createBEM('demo-search-picker');

type SearchPickerState = {
  cityValue: string;
  showPicker: boolean;
  pickerValue: string;
};

export class SearchPickerRouteComponent extends React.Component<any, SearchPickerState> {
  state: SearchPickerState = {
    cityValue: '',
    showPicker: false,
    pickerValue: '',
  };

  onClick(): void {
    this.setState({
      showPicker: true,
    });
  }

  onChange<T extends string | string[]>(value: T): void {
    toast({
      message: `Value: ${value}`,
    });
  }

  onConfirm(value: string): void {
    this.setState({
      cityValue: value,
      showPicker: false,
      pickerValue: value,
    });
  }

  onCancel(): void {
    this.setState({
      showPicker: false,
    });
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="SearchPicker" type="search-picker" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <div className={bem('card')}>
              <SearchPicker title="Title" onChange={this.onChange} />
            </div>
          </section>

          <section>
            <h2>With Popup</h2>
            <div className={bem('cityinput')} onClick={this.onClick.bind(this)}>
              <span>城市</span>
              <span>{this.state.cityValue}</span>
            </div>
          </section>

          <Popup show={this.state.showPicker} position="bottom" onClickClose={this.onCancel.bind(this)}>
            <SearchPicker
              title="Title"
              toolbarPosition="bottom"
              onCancel={this.onCancel.bind(this)}
              onConfirm={this.onConfirm.bind(this)}
            />
          </Popup>
        </div>
      </React.Fragment>
    );
  }
}
