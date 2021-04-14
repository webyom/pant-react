import React from 'react';
import { toast } from '../../toast';
import { DataList, DataListColumn } from '../../data-list';
import { toolbar } from '../addons/toolbar';
import { sortable, SortBy } from '../../data-list/addons/sortable';
import { filterable } from '../../data-list/addons/filterable';
import { selectable } from '../../data-list/addons/selectable';
import { recordActions } from '../../data-list/addons/record-actions';
import { batchActions } from '../../data-list/addons/batch-actions';
import { pageable } from '../../data-list/addons/pageable';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-data-list');

const records = [
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
  {
    name: 'Gary',
    mobile: '1867551****',
    wechat: 'gary',
    qq: '25183****',
    weibo: 'gary',
  },
];

const columns: DataListColumn[] = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'mobile',
    header: 'Mobile',
    render(options) {
      return options.record.mobile;
    },
  },
  {
    key: 'wechat',
    header: 'Wechat',
  },
  {
    key: 'qq',
    header: 'QQ',
  },
  {
    key: 'weibo',
    header: 'Weibo',
  },
];

type DataListRouteState = {
  selectedValue: string[];
  sortValue: SortBy[];
  filterValue: Record<string, any>;
};

export class DataListRouteComponent extends React.PureComponent {
  private containerRef = React.createRef<HTMLDivElement>();

  state: DataListRouteState = {
    selectedValue: ['0'],
    sortValue: [{ by: 'name', order: 'desc' }],
    filterValue: { exactMatch: true, name: 'Gary', birthday: new Date() },
  };

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="DataList" type="data-list" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <DataList
              columns={columns.slice(0, 4)}
              records={records}
              addons={[
                toolbar(),
                filterable({
                  columns: [
                    { key: 'exactMatch', header: 'Exact Match', type: 'switch' },
                    { key: 'name', header: 'Name', placeholder: 'Input name' },
                    { key: 'mobile', header: 'Mobile', placeholder: 'Input mobile' },
                    { key: 'wechat', header: 'Wechat', placeholder: 'Input wechat' },
                    {
                      key: 'city',
                      header: 'City',
                      placeholder: 'Select city',
                      type: 'single-selection',
                      options: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
                    },
                    {
                      key: 'hobby',
                      header: 'Hobby',
                      placeholder: 'Select hobby',
                      type: 'multiple-selection',
                      options: [
                        'Football',
                        'Basketball',
                        'Tennis',
                        'Ping Pong Ball',
                        'Swiming',
                        'Travel',
                        'Reading',
                        'Cooking',
                        'Walking',
                        'Watching TV',
                        'Driving',
                      ],
                    },
                    {
                      key: 'birthday',
                      header: 'Birthday',
                      placeholder: 'Select birthday',
                      type: 'datetime',
                      datetimeType: 'date',
                    },
                    {
                      key: 'createdAt',
                      header: 'Created At',
                      placeholder: 'Select datetime range',
                      type: 'datetime-range',
                      datetimeType: 'datetime',
                    },
                  ],
                  value: this.state.filterValue,
                  onChange: (value) => {
                    this.setState({ filterValue: value });
                  },
                }),
                recordActions({
                  actions: [
                    {
                      name: 'View',
                      action(record) {
                        toast(`View ${record.name}`);
                      },
                    },
                    {
                      name: 'Delete',
                      action(record) {
                        toast(`Delete ${record.name}`);
                      },
                    },
                  ],
                }),
                pageable(),
              ]}
            />
          </section>

          <section>
            <h2>Sticky</h2>
            <div ref={this.containerRef}>
              <DataList
                columns={columns}
                records={records}
                addons={[
                  toolbar({ sticky: true, stickyContainer: this.containerRef }),
                  batchActions({
                    getActions() {
                      return [
                        {
                          name: 'Toggle',
                          action(selectable) {
                            selectable.toggleAll();
                          },
                        },
                        {
                          name: 'New',
                          action(selectable) {
                            console.log(selectable.getValue()); /* eslint-disable-line */
                          },
                        },
                        {
                          name: 'View',
                          action(selectable) {
                            console.log(selectable.getValue()); /* eslint-disable-line */
                          },
                        },
                        {
                          name: 'Delete',
                          action(selectable) {
                            console.log(selectable.getValue()); /* eslint-disable-line */
                          },
                        },
                      ];
                    },
                  }),
                  sortable({
                    columns: [
                      { key: 'name', header: 'Name', prefer: 'asc' },
                      { key: 'mobile', header: 'Mobile' },
                      { key: 'wechat', header: 'Wechat' },
                    ],
                    value: this.state.sortValue,
                    onChange: (value) => {
                      this.setState({ sortValue: value });
                    },
                  }),
                  filterable({
                    onPopup: () => {
                      return false;
                    },
                  }),
                  selectable({
                    value: this.state.selectedValue,
                    onChange: (value) => {
                      this.setState({ selectedValue: value });
                    },
                  }),
                  recordActions({
                    actions: [
                      {
                        name: 'View',
                        action(record) {
                          toast(`View ${record.name}`);
                        },
                      },
                      {
                        name: 'Delete',
                        action(record) {
                          toast(`Delete ${record.name}`);
                        },
                      },
                    ],
                  }),
                  pageable({ pageSize: 10, sticky: true, stickyContainer: this.containerRef }),
                ]}
              />
            </div>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
