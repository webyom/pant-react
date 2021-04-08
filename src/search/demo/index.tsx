import React from 'react';
import { debounce } from 'lodash-es';
import { toast } from '../../toast';
import { Button } from '../../button';
import { Search } from '../../search';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-search');

export class SearchRouteComponent extends React.PureComponent {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="Search" type="search" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <Search />
          </section>

          <section>
            <h2>Listen to Events</h2>
            <Search
              showAction
              placeholder="Input something"
              onChange={debounce((val) => val && toast(val), 500)}
              onSearch={(val) => val && toast(val)}
            />
          </section>

          <section>
            <h2>Input Align</h2>
            <Search inputAlign="center" />
          </section>

          <section>
            <h2>Disabled</h2>
            <Search showAction disabled />
          </section>

          <section>
            <h2>Custom Background Color</h2>
            <Search shape="round" clearTrigger="always" background="#4fc08d" />
          </section>

          <section>
            <h2>Custom Action Button</h2>
            <Search
              label="Address"
              showAction
              icon=""
              actionNode={
                <Button size="small" icon="search">
                  Search
                </Button>
              }
              onSearch={(val) => val && toast(val)}
            />
          </section>
        </div>
      </React.Fragment>
    );
  }
}
