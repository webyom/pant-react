import React from 'react';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import { Popup } from '../../popup';
import { SearchPicker } from '../../search-picker';
import { toast } from '../../toast';
import './index.scss';

const data = [
  '河北省邯郸市',
  '河北省保定市',
  '河北省张家口市',
  '山西省大同市',
  '内蒙呼和浩特市',
  '辽宁省本溪市',
  '辽宁省丹东市',
  '辽宁省锦州市',
  '辽宁省阜新市',
  '辽宁省辽阳市',
  '黑龙江省鸡西市',
  '黑龙江省鹤岗市',
  '黑龙江省大庆市',
  '黑龙江省伊春市',
  '黑龙江省佳木斯市',
  '黑龙江省牡丹江市',
  '江苏省无锡市',
  '江苏省常州市',
  '江苏省苏州市',
  '浙江省宁波市',
  '安徽省合肥市',
  '安徽省淮南市',
  '安徽省淮北市',
  '福建省厦门市',
  '山东省枣庄市',
  '山东省烟台市',
  '山东省潍坊市',
  '山东省泰安市',
  '山东省临沂市',
  '河南省开封市',
  '河南省洛阳市',
  '河南省平顶山市',
  '河南省安阳市',
  '河南省新乡市',
  '河南省焦作市',
  '湖北省黄石市',
  '湖北省襄樊市',
  '湖北省荆州市',
  '湖南省株洲市',
  '湖南省湘潭市',
  '湖南省衡阳市',
  '广东省深圳市',
  '广东省汕头市',
  '广东省湛江市',
  '广西南宁市',
  '广西柳州市',
  '青海省西宁市',
];

const bem = createBEM('demo-search-picker');

type SearchPickerState = {
  cityValue: string[];
  showPicker: boolean;
};

export class SearchPickerRouteComponent extends React.PureComponent<any, SearchPickerState> {
  state: SearchPickerState = {
    cityValue: ['河北省保定市'],
    showPicker: false,
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

  onConfirm(value: string[]): void {
    this.setState({
      cityValue: value,
      showPicker: false,
    });
  }

  onCancel(): void {
    this.setState({
      showPicker: false,
    });
  }

  onSearch(text: string, cb: (data: string[] | Record<string, any>[]) => void): void {
    text = text.trim();
    if (!text) {
      cb([]);
      return;
    }
    cb(data.filter((item) => item.indexOf(text) >= 0));
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="SearchPicker" type="search-picker" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <div className={bem('card')}>
              <SearchPicker title="Title" data={data} onChange={this.onChange} />
            </div>
          </section>

          <section>
            <h2>On Search</h2>
            <div className={bem('card')}>
              <SearchPicker title="Title" onChange={this.onChange} onSearch={this.onSearch.bind(this)} />
            </div>
          </section>

          <section>
            <h2>With Popup</h2>
            <div className={bem('cityinput')} onClick={this.onClick.bind(this)}>
              <span>城市</span>
              <span>{this.state.cityValue.join(', ')}</span>
            </div>
          </section>

          <Popup show={this.state.showPicker} position="bottom" onClickClose={this.onCancel.bind(this)} round>
            <SearchPicker
              title="Title"
              data={data}
              defaultValue={this.state.cityValue}
              maxSelection={2}
              onCancel={this.onCancel.bind(this)}
              onConfirm={this.onConfirm.bind(this)}
            />
          </Popup>
        </div>
      </React.Fragment>
    );
  }
}
