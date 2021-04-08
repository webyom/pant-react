import React from 'react';
import { CheckboxGroup, CheckboxGroupBaseProps } from '../checkbox-group';
import { omit, isDef } from '../utils';

export type RadioGroupProps = CheckboxGroupBaseProps & {
  defaultValue?: string;
};

export class RadioGroup extends React.PureComponent<RadioGroupProps> {
  private readonly ref = React.createRef<CheckboxGroup>();

  getValue(): string {
    const res = this.ref.current.getValue();
    return res && res[0];
  }

  render(): JSX.Element {
    const { defaultValue } = this.props;
    const passProps = omit(this.props, ['defaultValue', 'max', 'onMaxLimit']);
    return (
      <CheckboxGroup
        {...passProps}
        ref={this.ref}
        defaultValue={(isDef(defaultValue) && [defaultValue]) || undefined}
        role="radio"
        max="1"
      />
    );
  }
}
