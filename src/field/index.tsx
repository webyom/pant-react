import React from 'react';
import clsx from 'clsx';
import { isDef, addUnit } from '../utils';
import { closest } from '../utils/dom';
import { createBEM } from '../utils/bem';
import { Icon } from '../icon';
import { Cell, CellProps } from '../cell';
import { Checkbox, CheckboxProps } from '../checkbox';
import { Switch, SwitchProps } from '../switch';
import './index.scss';

export type ValidatorFn<T> = (value: T) => Promise<string | void>;

export type ValidateTrigger = 'blur' | 'change';

export type PatternValidator = {
  readonly trigger?: ValidateTrigger[];
  readonly pattern: string | RegExp;
  readonly message: string;
};

export type FnValidator<T> = {
  readonly trigger?: ValidateTrigger[];
  readonly validator: ValidatorFn<T>;
};

export type ValidateRule<T> = PatternValidator | FnValidator<T> | ValidatorFn<T>;

export type FieldProps<T> = Omit<CellProps, 'onClick'> & {
  type?:
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'digit'
    | 'email'
    | 'file'
    | 'month'
    | 'number'
    | 'password'
    | 'range'
    | 'search'
    | 'switch'
    | 'tel'
    | 'text'
    | 'textarea'
    | 'time'
    | 'url'
    | 'week';
  name: string;
  defaultValue?: T;
  rules?: ValidateRule<T>[] | ValidatorFn<T>;
  disabled?: boolean;
  readOnly?: boolean;
  autosize?: boolean | { minHeight: number; maxHeight: number };
  button?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  clearTrigger?: 'always' | 'focus';
  maxlength?: number | string;
  labelWidth?: number | string;
  labelClass?: null;
  labelAlign?: 'center' | 'right';
  inputAlign?: 'center' | 'right';
  direction?: 'row' | 'column';
  bodyStyle?: Record<string, string>;
  placeholder?: string;
  errorMessage?: string;
  errorMessageAlign?: 'center' | 'right';
  showWordLimit?: boolean;
  validateTrigger?: ValidateTrigger[];
  valueFormatter?(value: any): T;
  displayValueFormatter?(value: T): React.ReactNode;
  onClosePopup?(field: Field<T>, confirm?: boolean): void;
  onInputKeyDown?(evt: React.KeyboardEvent): void;
  onInputChange?(evt: React.ChangeEvent): string | void;
  onChange?(value: T): void;
  onFocus?(evt: React.FocusEvent): void;
  onBlur?(evt: React.FocusEvent): void;
  onClick?: (evt: React.MouseEvent) => void;
};

type FieldState<T> = {
  isInputType: boolean;
  focused: boolean;
  showPopup: boolean;
  popupValue: T;
  value: T;
  validateMessage: string;
  prevProps: FieldProps<T>;
};

const bem = createBEM('pant-field');

function isFnValidatorType<T>(type: PatternValidator | FnValidator<T>): type is FnValidator<T> {
  return typeof (type as FnValidator<T>).validator === 'function';
}

function isInputType(type: string, children: React.ReactNode): boolean {
  return (!type && !children) || (!!type && !['checkbox', 'switch'].includes(type));
}

function normalizeDefaultValue(dv: any, isInputType: boolean): any {
  if (isDef(dv)) {
    return dv;
  } else if (isInputType) {
    return '';
  } else {
    return dv;
  }
}

const NO_MATCHED_RULE_FLAG = '__NO_MATCHED_RULE_FLAG__';

export class Field<T = never> extends React.PureComponent<FieldProps<T>, FieldState<T>> {
  static defaultProps = {
    clearTrigger: 'focus',
  };

  private isPopup = false;
  private readonly inputRef = React.createRef<any>();
  private readonly bodyRef = React.createRef<HTMLDivElement>();

  constructor(props: React.PropsWithChildren<FieldProps<T>>) {
    super(props);
    const iit = isInputType(props.type, props.children);
    const value = normalizeDefaultValue(props.defaultValue, iit);
    this.state = {
      isInputType: iit,
      focused: false,
      showPopup: false,
      popupValue: value,
      value: value,
      validateMessage: '',
      prevProps: props,
    };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onCheckboxClick = this.onCheckboxClick.bind(this);
    this.onSwitchClick = this.onSwitchClick.bind(this);
    this.onPopupControlClick = this.onPopupControlClick.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.closePopup = this.closePopup.bind(this);
  }

  static getDerivedStateFromProps<T>(
    props: React.PropsWithChildren<FieldProps<T>>,
    state: FieldState<T>,
  ): FieldState<T> {
    const defaultValueChanged = props.defaultValue !== state.prevProps.defaultValue;
    const iit = isInputType(props.type, props.children);
    const value = normalizeDefaultValue(props.defaultValue, iit);
    return {
      isInputType: iit,
      focused: state.focused,
      showPopup: state.showPopup,
      popupValue: defaultValueChanged ? value : state.popupValue,
      value: defaultValueChanged ? value : state.value,
      validateMessage: defaultValueChanged ? '' : state.validateMessage,
      prevProps: props,
    };
  }

  componentDidMount(): void {
    this.adjustSize();
    if (this.isPopup) {
      this.setState({ popupValue: this.formatReturnValue(this.getRawValue()) });
    }
  }

  componentDidUpdate(): void {
    this.adjustSize();
  }

  private isEmptyValue(popupValue: any): boolean {
    if (Array.isArray(popupValue)) {
      return popupValue.length === 0;
    }
    return popupValue == null || popupValue === '';
  }

  private get showClear(): boolean {
    const { clearable, clearTrigger, readOnly, disabled } = this.props;
    const { isInputType, focused, value, popupValue } = this.state;
    if (this.isPopup && !readOnly && !disabled && !this.isEmptyValue(popupValue)) {
      return clearable;
    }
    return (
      isInputType &&
      clearable &&
      !readOnly &&
      (clearTrigger === 'always' || focused) &&
      ((value as unknown) as string) !== '' &&
      isDef(value)
    );
  }

  private get showError(): boolean {
    const { errorMessage } = this.props;
    const { validateMessage } = this.state;
    return !!validateMessage || !!errorMessage;
  }

  getName(): string {
    return this.props.name;
  }

  getRawValue(): any {
    const { type } = this.props;
    const { isInputType, value } = this.state;

    if (this.isCustomChild()) {
      return (this.inputRef.current as any)?.getValue();
    } else if (isInputType) {
      return value;
    } else if (type === 'checkbox' || type === 'switch') {
      return (!!value as unknown) as T;
    }
  }

  getValue(): T {
    if (this.isPopup) {
      return this.state.popupValue;
    }
    return this.formatReturnValue(this.getRawValue());
  }

  private isCustomChild(): boolean {
    const { type, children } = this.props;
    if (!type && children) {
      return true;
    }
    return false;
  }

  private onFocus(evt: React.FocusEvent): void {
    this.setState({ focused: true });
    this.props.onFocus && this.props.onFocus(evt);
  }

  private onBlur(evt: React.FocusEvent): void {
    this.setState({ focused: false }, () => {
      this.validateWithTrigger('blur').then((msg) => {
        msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
      });
    });
    this.props.onBlur && this.props.onBlur(evt);
  }

  private onCustomChange(onChange: (...args: any[]) => void, ...args: any[]): void {
    this.validateWithTrigger('change').then((msg) => {
      msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
    });
    if (onChange) {
      onChange(...args);
    }
    this.props.onChange && this.props.onChange(this.getValue());
  }

  private onInputChange(evt: React.ChangeEvent): void {
    const { onInputChange, onChange } = this.props;
    const returnValue = onInputChange && onInputChange(evt);
    this.setState(
      { value: returnValue !== undefined ? String(returnValue) : ((evt.target as HTMLInputElement).value as any) },
      () => {
        this.validateWithTrigger('change').then((msg) => {
          msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
        });
        onChange && onChange(this.getValue());
      },
    );
  }

  private onCheckboxClick(evt: React.MouseEvent, props: CheckboxProps): void {
    this.setState({ value: (!props.checked as unknown) as T }, () => {
      this.validateWithTrigger('change').then((msg) => {
        msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
      });
      this.props.onChange && this.props.onChange(this.getValue());
    });
  }

  private onSwitchClick(evt: React.MouseEvent, props: SwitchProps): void {
    this.setState({ value: (!props.on as unknown) as T }, () => {
      this.validateWithTrigger('change').then((msg) => {
        msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
      });
      this.props.onChange && this.props.onChange(this.getValue());
    });
  }

  openPopup(): void {
    if (!this.isPopup) {
      return;
    }
    this.setState({ showPopup: true });
  }

  closePopup(confirm?: boolean): void {
    if (!this.isPopup) {
      return;
    }
    const { onClosePopup, onChange } = this.props;
    if (confirm) {
      this.setState({ showPopup: false, popupValue: this.formatReturnValue(this.getRawValue()) }, () => {
        this.validateWithTrigger('change').then((msg) => {
          msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
        });
        onClosePopup && onClosePopup(this, confirm);
        onChange && onChange(this.getValue());
      });
    } else {
      this.setState({ showPopup: false }, () => {
        onClosePopup && onClosePopup(this, confirm);
      });
    }
  }

  private onPopupControlClick(evt: React.MouseEvent): void {
    if (closest(evt.target, '.pant-field__clear', true)) {
      return;
    }

    const { disabled, readOnly } = this.props;

    if (this.isPopup && !disabled && !readOnly) {
      const target = evt.target as HTMLElement;
      const field = closest(target, '.pant-field', true);
      if (field && field.querySelector('.pant-field__body') === this.bodyRef.current) {
        this.openPopup();
      }
    }
  }

  private clearInput(): void {
    if (this.isPopup) {
      (this.inputRef.current as any).clearValue(() => {
        this.setState({ popupValue: this.formatReturnValue(this.getRawValue()) }, () => {
          const { onChange } = this.props;
          onChange && onChange(this.getValue());
        });
      });
    } else {
      const value: any = '';
      this.setState({ value }, () => {
        const { onChange } = this.props;
        onChange && onChange(this.getValue());
      });
    }
  }

  private adjustSize(): void {
    const input = this.inputRef.current;
    const { type, autosize } = this.props;
    if (!(type === 'textarea' && autosize) || !input) {
      return;
    }

    input.style.height = 'auto';

    let height = input.scrollHeight;
    if (typeof autosize === 'object') {
      const { maxHeight, minHeight } = autosize;
      if (maxHeight) {
        height = Math.min(height, maxHeight);
      } else if (minHeight) {
        height = Math.max(height, minHeight);
      }
    }

    if (height) {
      input.style.height = height + 'px';
    }
  }

  private async validateWithTrigger(trigger: ValidateTrigger): Promise<string | void> {
    const { validateTrigger = [], rules } = this.props;
    if (typeof rules === 'function') {
      if (validateTrigger.includes(trigger)) {
        return this.validate(rules);
      }
    } else if (rules && rules.length) {
      const matchedRules = rules.filter((rule) => {
        if (typeof rule === 'function') {
          return validateTrigger.includes(trigger);
        } else {
          return (
            (rule.trigger && rule.trigger.includes(trigger)) || (!rule.trigger && validateTrigger.includes(trigger))
          );
        }
      });
      if (matchedRules.length) {
        return this.validate(matchedRules);
      }
    }
    return NO_MATCHED_RULE_FLAG;
  }

  private async validate(rules?: ValidateRule<T>[] | ValidatorFn<T>): Promise<string | void> {
    const { type, rules: propRules } = this.props;
    rules = rules || propRules;
    if (rules) {
      const value = this.getValue();
      if (typeof rules === 'function') {
        return rules(value);
      } else if (rules.length) {
        return rules.reduce(async (promise, rule) => {
          return promise.then((msg) => {
            if (msg) {
              return msg;
            } else {
              if (typeof rule === 'function') {
                return rule(value);
              } else if (isFnValidatorType<T>(rule)) {
                return rule.validator(value);
              } else {
                if (typeof rule.pattern === 'string') {
                  if (rule.pattern === 'required') {
                    if (type === 'checkbox' || type === 'switch') {
                      if (!value) {
                        return rule.message;
                      }
                    } else {
                      if (!isDef(value) || (typeof value === 'string' && value.trim() === '')) {
                        return rule.message;
                      }
                    }
                  }
                } else {
                  if (isDef(value) && !rule.pattern.test(value + '')) {
                    return rule.message;
                  }
                }
              }
            }
          });
        }, Promise.resolve(''));
      }
    }
  }

  private formatReturnValue(value: any): T {
    const { valueFormatter } = this.props;
    if (!isDef(value) || !valueFormatter) {
      return value;
    }
    return valueFormatter(value);
  }

  private formatDisplayValue(value: any): React.ReactNode {
    const { displayValueFormatter } = this.props;
    if (!isDef(value)) {
      return '';
    }

    if (displayValueFormatter) {
      return displayValueFormatter(value);
    }

    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  }

  async doValidate(): Promise<string | void> {
    return this.validate().then((msg) => {
      this.setState({ validateMessage: msg || '' });
      return msg;
    });
  }

  private genInput(): JSX.Element {
    const { props } = this;
    const { type, name, inputAlign, readOnly, children } = props;
    const { showPopup, popupValue, isInputType, value } = this.state;

    if (this.isCustomChild()) {
      const childrenWithProps = [].concat(children).map((child, index) => {
        const isPopup = (this.isPopup = child.type?.__FIELD_BEHAVIOR__ === 'Popup');
        if (!child.type || typeof child.type === 'string') {
          return child;
        }
        return React.cloneElement(child, {
          key: index,
          ref: this.inputRef,
          onChange: this.onCustomChange.bind(this, child.props.onChange),
          show: isPopup ? showPopup : undefined,
          closePopup: isPopup ? this.closePopup : undefined,
        });
      });
      if (this.isPopup) {
        const displayValue = this.formatDisplayValue(popupValue);
        return (
          <React.Fragment>
            {displayValue ? (
              <div className={bem('control', [inputAlign, 'custom'])}>{displayValue}</div>
            ) : (
              <input
                className={bem('control', [inputAlign, 'custom'])}
                value=""
                placeholder={readOnly ? '' : props.placeholder}
                readOnly
              />
            )}
            {childrenWithProps}
          </React.Fragment>
        );
      } else {
        return <div className={bem('control', [inputAlign, 'custom'])}>{childrenWithProps}</div>;
      }
    }

    if (isInputType) {
      const inputProps = {
        value: isDef(value) ? value + '' : '',
        className: bem('control', inputAlign),
        name: name,
        disabled: props.disabled,
        readOnly: props.readOnly,
        placeholder: props.placeholder,
        onFocus: this.onFocus,
        onBlur: this.onBlur,
        onChange: this.onInputChange,
        onKeyDown: props.onInputKeyDown,
        ref: this.inputRef,
      };

      if (type === 'textarea') {
        return <textarea rows={1} {...inputProps} />;
      }

      let inputType = type || 'text';
      let inputMode: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

      // type="number" is weired in iOS, and can't prevent dot in Android
      // so use inputmode to set keyboard in mordern browers
      if (type === 'number') {
        inputType = 'text';
        inputMode = 'decimal';
      } else if (type === 'digit') {
        inputType = 'tel';
        inputMode = 'numeric';
      }

      return <input type={inputType} inputMode={inputMode} maxLength={+props.maxlength || undefined} {...inputProps} />;
    } else if (type === 'checkbox') {
      return (
        <div className={bem('control', [inputAlign, 'custom'])}>
          <Checkbox name={name} shape="square" checked={!!value} onClick={this.onCheckboxClick}></Checkbox>
        </div>
      );
    } else if (type === 'switch') {
      return (
        <div className={bem('control', [inputAlign, 'custom'])}>
          <Switch name={name} size="20" on={!!value} onClick={this.onSwitchClick}></Switch>
        </div>
      );
    }
  }

  private genRightIcon(): React.ReactNode {
    const { rightIcon } = this.props;
    if (typeof rightIcon === 'string') {
      return <Icon name={rightIcon} />;
    } else if (rightIcon) {
      return rightIcon;
    }
  }

  private genWordLimit(): JSX.Element {
    const { showWordLimit, maxlength } = this.props;
    const { isInputType, value } = this.state;
    if (isInputType && showWordLimit && maxlength) {
      const count = ((value || '') as string).toString().length;
      const full = count >= maxlength;

      return (
        <div className={bem('word-limit')}>
          <span className={bem('word-num', { full })}>{count}</span>/{maxlength}
        </div>
      );
    }
  }

  private genMessage(): JSX.Element {
    const { errorMessage, errorMessageAlign } = this.props;
    const { validateMessage } = this.state;
    const message = validateMessage || errorMessage;
    if (message) {
      return <div className={bem('error-message', errorMessageAlign)}>{message}</div>;
    }
  }

  render(): JSX.Element {
    const { props } = this;
    const { disabled, readOnly, clearTrigger, labelAlign, labelWidth, style, bodyStyle } = props;
    const input = this.genInput();
    const onClick =
      typeof props.onClick === 'function' ? props.onClick : this.isPopup ? this.onPopupControlClick : null;
    return (
      <Cell
        label={props.label}
        title={props.title}
        icon={props.icon}
        center={props.center}
        border={props.border}
        required={props.required}
        className={clsx(
          bem({
            row: props.direction !== 'column',
            column: props.direction === 'column',
            error: this.showError,
            disabled: disabled,
            readonly: readOnly,
            'min-height': props.type === 'textarea' && !props.autosize,
          }),
          props.className,
        )}
        titleClassName={bem('title', { [`${labelAlign}`]: labelAlign })}
        titleStyle={labelWidth ? { width: addUnit(labelWidth) } : undefined}
        valueClassName={bem('value')}
        onClick={(!disabled && !readOnly && onClick) || null}
        style={style}
      >
        <div ref={this.bodyRef} className={bem('body')} style={bodyStyle}>
          {input}
          {this.showClear && (
            <Icon
              name="clear"
              className={bem('clear')}
              onClick={this.isPopup || clearTrigger === 'always' ? this.clearInput : undefined}
              onTouchStart={!this.isPopup && clearTrigger === 'focus' ? this.clearInput : undefined}
            />
          )}
          {this.genRightIcon()}
          {props.button && <div className={bem('button')}>{props.button}</div>}
        </div>
        {this.genWordLimit()}
        {this.genMessage()}
      </Cell>
    );
  }
}
