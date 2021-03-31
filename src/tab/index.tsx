import React from 'react';
import './index.scss';

export { Tabs, TabInfo } from './tabs';

export type TabProps = {
  title: string;
  titleNode?: React.ReactNode;
  name?: string;
  dot?: boolean;
  info?: number | string;
  disabled?: boolean;
  lazyRender?: boolean;
  isActive?: boolean;
};

export class Tab extends React.Component<TabProps> {
  private inited = false;

  render(): JSX.Element {
    const { isActive, lazyRender, children } = this.props;
    const shouldRender = (this.inited = this.inited || isActive || !lazyRender);
    return <React.Fragment>{shouldRender ? children : null}</React.Fragment>;
  }
}
