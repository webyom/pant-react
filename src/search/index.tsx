import React, { useRef } from 'react';
import { Field } from '../field';
import { createBEM } from '../utils/bem';
import './index.scss';

export type SearchProps = {
  shape?: 'sqaure' | 'round';
  defaultValue?: string;
  label?: string;
  icon?: React.ReactNode;
  inputAlign?: 'center' | 'right';
  disabled?: boolean;
  clearable?: boolean;
  clearTrigger?: 'always' | 'focus';
  background?: string;
  actionText?: string;
  actionNode?: React.ReactNode;
  showAction?: boolean;
  onSearch?(value: string): void;
  onChange?(value: string): void;
};

const bem = createBEM('pant-search');

export const Search: React.FC<SearchProps> = (props) => {
  const fieldRef = useRef<Field<string>>();

  function Label() {
    if (props.label) {
      return <div className={bem('label')}>{props.label}</div>;
    }
  }

  function Action() {
    if (!props.showAction) {
      return;
    }

    function onSearch() {
      if (props.disabled) {
        return;
      }
      props.onSearch && props.onSearch(fieldRef.current.getValue());
    }

    if (props.actionNode) {
      return (
        <div className={bem('custom-action')} onClick={onSearch}>
          {props.actionNode}
        </div>
      );
    }

    return (
      <div className={bem('action', { disabled: props.disabled })} role="button" tabIndex={0} onClick={onSearch}>
        {props.actionText || 'Search'}
      </div>
    );
  }

  return (
    <div className={bem({ 'show-action': props.showAction })} style={{ background: props.background }}>
      <div className={bem('content', props.shape)}>
        {Label()}
        <Field<string>
          ref={fieldRef}
          name="search"
          type="search"
          border={false}
          inputAlign={props.inputAlign}
          disabled={props.disabled}
          defaultValue={props.defaultValue}
          icon={props.icon || undefined}
          clearable={props.clearable}
          clearTrigger={props.clearTrigger}
          onChange={props.onChange}
        />
      </div>
      {Action()}
    </div>
  );
};

Search.defaultProps = {
  shape: 'sqaure',
  icon: 'search',
  clearable: true,
};
