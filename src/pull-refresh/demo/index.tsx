import React from 'react';
import { toast } from '../../toast';
import { Tabs, Tab } from '../../tab';
import { PullRefresh } from '../../pull-refresh';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-pull-refresh');

const PullingDoge: React.FC<{ distance?: number }> = props => (
  <img
    className="doge"
    src="https://b.yzcdn.cn/vant/doge.png"
    style={{ transform: `scale(${(props.distance || 80) / 80})` }}
  />
);

export class PullRefreshRouteComponent extends React.Component<{}, { count: number }> {
  state = {
    count: 0,
  };

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="PullRefresh" type="pull-refresh" />
        <div className={bem()}>
          <Tabs scrollable>
            <Tab title="Basic Usage">
              <PullRefresh
                onRefresh={(): Promise<void> => {
                  return new Promise(resolve => {
                    setTimeout(() => {
                      this.setState({ count: this.state.count + 1 });
                      toast('Refresh success');
                      resolve();
                    }, 2000);
                  });
                }}
              >
                <p>Refresh Count: {this.state.count}</p>
              </PullRefresh>
            </Tab>
            <Tab title="Success Tip">
              <PullRefresh
                successText="Refresh success"
                onRefresh={(): Promise<void> => {
                  return new Promise(resolve => {
                    setTimeout(() => {
                      this.setState({ count: this.state.count + 1 });
                      resolve();
                    }, 2000);
                  });
                }}
              >
                <p>Refresh Count: {this.state.count}</p>
              </PullRefresh>
            </Tab>
            <Tab title="Custom Tips">
              <PullRefresh
                headHeight="80"
                pullingNode={<PullingDoge />}
                loosingNode={<PullingDoge />}
                loadingNode={<img src="https://b.yzcdn.cn/vant/doge-fire.jpg" className="doge" />}
                onRefresh={(): Promise<void> => {
                  return new Promise(resolve => {
                    setTimeout(() => {
                      this.setState({ count: this.state.count + 1 });
                      toast('Refresh success');
                      resolve();
                    }, 2000);
                  });
                }}
              >
                <p>Refresh Count: {this.state.count}</p>
              </PullRefresh>
            </Tab>
            <Tab title="Disabled">
              <PullRefresh disabled>
                <p>Refresh Count: {this.state.count}</p>
              </PullRefresh>
            </Tab>
          </Tabs>
        </div>
      </React.Fragment>
    );
  }
}
