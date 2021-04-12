import React from 'react';
import { Sticky } from '../../sticky';
import { Button } from '../../button';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-sticky');

type StickyRouteState = {
  container?: React.RefObject<HTMLElement>;
};

export class StickyRouteComponent extends React.PureComponent<any, StickyRouteState> {
  private containerRef = React.createRef<HTMLDivElement>();
  state: StickyRouteState = {
    container: null,
  };

  componentDidMount(): void {
    this.setState({ container: this.containerRef });
  }

  render(): JSX.Element {
    const container = this.state.container;

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
              {container ? (
                <>
                  <Sticky offsetTop="50" offsetBottom="50" container={container}>
                    <Button type="warning" style={{ marginLeft: '205px' }}>
                      Stick Top
                    </Button>
                  </Sticky>
                  <div className="sticky-container__content"></div>
                  <Sticky offsetTop="50" offsetBottom="50" container={container} stickBottom>
                    <Button type="warning" style={{ marginLeft: '205px' }}>
                      Stick Bottom
                    </Button>
                  </Sticky>
                </>
              ) : null}
            </div>
          </section>

          <section>
            <h2>Stick Bottom</h2>
            <Sticky stickBottom>
              <Button type="danger">Stick Bottom</Button>
            </Sticky>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
