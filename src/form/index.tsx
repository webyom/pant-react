import React from 'react';
import { preventDefault } from '../utils/event';
import { createBEM } from '../utils/bem';
import { Field, ValidateTrigger } from '../field';

export type SubmitResult<T = any> = {
  ok: boolean;
  message: string;
  data: T;
};

export type FormProps<T> = {
  validateTrigger?: ValidateTrigger[];
  onSubmit?: (res: Promise<SubmitResult<T>>) => void;
};

const bem = createBEM('pant-form');

export class Form<T = never> extends React.PureComponent<FormProps<T>> {
  private bindedOnSubmit = this.onSubmit.bind(this);
  private readonly childRefs: Record<string, React.RefObject<Field<any>>> = {};

  private onSubmit(evt: React.FormEvent): void {
    const { onSubmit } = this.props;
    preventDefault(evt);
    const res = Object.entries(this.childRefs)
      .map(([name, ref]) => {
        return { name, ref };
      })
      .reduce(
        async (promise, item) => {
          return promise.then((res) => {
            const field = item.ref.current;
            return field.doValidate().then((msg) => {
              return {
                ok: msg ? false : res.ok,
                message: res.message || msg || '',
                data: { ...res.data, [item.name]: field.getValue() },
              };
            });
          });
        },
        Promise.resolve<SubmitResult>({ ok: true, message: '', data: {} }),
      );
    onSubmit && onSubmit(res);
  }

  render(): JSX.Element {
    const { children, validateTrigger } = this.props;
    const childrenWithProps = [].concat(children).map((child, index) => {
      let ref: React.RefObject<any> = null;
      const { name, validateTrigger: childValidateTrigger } = child.props;
      if (name) {
        ref = this.childRefs[name] = this.childRefs[name] || child.ref || React.createRef();
        return React.cloneElement(child, { ref, key: index, validateTrigger: childValidateTrigger || validateTrigger });
      }
      return child;
    });
    return (
      <form className={bem()} onSubmit={this.bindedOnSubmit}>
        {childrenWithProps}
      </form>
    );
  }
}
