import React from 'react';
import { toast } from '../../toast';
import { DataList, DataListColumn } from '../../data-list';
import { toolbox } from '../../data-list/addons/toolbox';
import { sortable } from '../../data-list/addons/sortable';
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
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
  },
  {
    name: 'Gary',
    mobile: '18675510948',
    wechat: 'garywang',
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
    render(options) {
      return options.record.wechat;
    },
  },
];

export class DataListRouteComponent extends React.PureComponent {
  private containerRef = React.createRef<HTMLDivElement>();

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="DataList" type="data-list" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <DataList
              columns={columns}
              records={records}
              addons={[
                toolbox(),
                sortable(),
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
                  toolbox({ sticky: true, stickyContainer: this.containerRef }),
                  batchActions({
                    getActions() {
                      return [
                        {
                          name: 'New',
                          action(records) {
                            console.log(records); /* eslint-disable-line */
                          },
                        },
                        {
                          name: 'View',
                          action(records) {
                            console.log(records); /* eslint-disable-line */
                          },
                        },
                        {
                          name: 'Delete',
                          action(records) {
                            console.log(records); /* eslint-disable-line */
                          },
                        },
                      ];
                    },
                  }),
                  sortable(),
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
                  pageable({ sticky: true, stickyContainer: this.containerRef }),
                ]}
              />
            </div>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
