import React from 'react';
import { Skeleton } from '../../skeleton';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import logoImg from '../../demos/assets/logo.png';
import './index.scss';

type SkeletonRouteComponentState = {
  show: boolean;
};

const bem = createBEM('demo-skeleton');

export class SkeletonRouteComponent extends React.PureComponent<any, SkeletonRouteComponentState> {
  state = {
    show: false,
  };

  componentDidMount(): void {
    setTimeout(() => {
      this.setState({ show: true });
    }, 2000);
  }

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="Skeleton" type="skeleton" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <Skeleton row="3" title />
          </section>

          <section>
            <h2>Show Avatar</h2>
            <Skeleton row="3" title avatar />
          </section>

          <section>
            <h2>Show Children</h2>
            <Skeleton row="3" title avatar loading={!this.state.show}>
              <div className="content">
                <img src={logoImg} />
                <div>
                  <h3>About Pant</h3>
                  <p>Pant is a set of Mobile UI Components built on React. Ported from Vant.</p>
                </div>
              </div>
            </Skeleton>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
