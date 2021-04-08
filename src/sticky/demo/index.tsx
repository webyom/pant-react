import React from 'react';
import { Sticky } from '../../sticky';
import { Button } from '../../button';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-sticky');

export class StickyRouteComponent extends React.PureComponent {
  private containerRef = React.createRef<HTMLDivElement>();

  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="Sticky" type="sticky" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <Sticky>
              <Button type="primary">Basic Usage</Button>
            </Sticky>
          </section>

          <section>
            <h2>Offset Top</h2>
            <Sticky offsetTop="50">
              <Button type="info" style={{ marginLeft: '100px' }}>
                Offset Top
              </Button>
            </Sticky>
          </section>

          <section>
            <h2>Set Container</h2>
            <div ref={this.containerRef} className="sticky-container">
              <Sticky offsetTop="50" container={this.containerRef}>
                <Button type="warning" style={{ marginLeft: '210px' }}>
                  Set Container
                </Button>
              </Sticky>
            </div>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
