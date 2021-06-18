import React from 'react';
import { Sticky } from '../../sticky';
import { Button } from '../../button';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-sticky');

export class StickyRouteComponent extends React.PureComponent {
  private containerRef = React.createRef<HTMLDivElement>();
  private containerRef2 = React.createRef<HTMLDivElement>();

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
            <div style={{ height: '300px' }}></div>
          </section>

          <section>
            <h2>Set Container</h2>
            <div ref={this.containerRef} className="sticky-container">
              <Sticky offsetTop="50" offsetBottom="50" container={this.containerRef}>
                <Button type="warning" style={{ marginLeft: '205px' }}>
                  Stick Top
                </Button>
              </Sticky>
              <div className="sticky-container__content"></div>
              <Sticky offsetTop="50" offsetBottom="50" container={this.containerRef} stickBottom>
                <Button type="warning" style={{ marginLeft: '205px' }}>
                  Stick Bottom
                </Button>
              </Sticky>
            </div>
          </section>

          <section>
            <h2>Stick Bottom</h2>
            <Sticky stickBottom>
              <Button type="danger">Stick Bottom</Button>
            </Sticky>
          </section>

          {/* <section>
            <h2>Stick Bottom</h2>
            <div style={{ height: '500px', backgroundColor: '#FFF', overflowY: 'auto' }}>
              <div style={{ height: '600px' }}></div>
              <div ref={this.containerRef2} style={{ backgroundColor: '#CCC', margin: '10px' }}>
                <div style={{ height: '300px' }}></div>
                <Sticky offsetTop="50" offsetBottom="50" container={this.containerRef2} stickBottom>
                  <Button type="danger">Stick Bottom</Button>
                </Sticky>
                <div style={{ height: '300px' }}></div>
              </div>
              <div style={{ height: '600px' }}></div>
            </div>
          </section> */}
        </div>
      </React.Fragment>
    );
  }
}
