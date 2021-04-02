import React from 'react';
import { isDef } from '../utils';
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
  maxlength?: number | string;
  labelWidth?: number | string;
  labelClass?: null;
  labelAlign?: 'center' | 'right';
  inputAlign?: 'center' | 'right';
  placeholder?: string;
  errorMessage?: string;
  errorMessageAlign?: 'center' | 'right';
  showWordLimit?: boolean;
  validateTrigger?: ValidateTrigger[];
  valueFormatter?(value: any): T;
  displayValueFormatter?(value: any): string;
  onClosePopup?(field: Field<T>, confirm?: boolean): void;
  onInputKeyDown?(evt: React.KeyboardEvent): void;
  onInputChange?(evt: React.ChangeEvent): string | void;
  onChange?(value: T): void;
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

export class Field<T = never> extends React.Component<FieldProps<T>, FieldState<T>> {
  private isPopup = false;
  private readonly inputRef = React.createRef<any>();
  private readonly bodyRef = React.createRef<HTMLDivElement>();

  constructor(props: React.PropsWithChildren<FieldProps<T>>) {
    super(props);
    const iit = isInputType(props.type, props.children);
    this.state = {
      isInputType: iit,
      focused: false,
      showPopup: false,
      popupValue: null,
      value: normalizeDefaultValue(props.defaultValue, iit),
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
    return {
      isInputType: iit,
      focused: state.focused,
      showPopup: state.showPopup,
      popupValue: state.popupValue,
      value: defaultValueChanged ? normalizeDefaultValue(props.defaultValue, iit) : state.value,
      validateMessage: defaultValueChanged ? '' : state.validateMessage,
      prevProps: props,
    };
  }

  componentDidMount(): void {
    this.adjustSize();
    if (this.isPopup) {
      this.setState({ popupValue: this.getValue() });
    }
  }

  componentDidUpdate(): void {
    this.adjustSize();
  }

  private get showClear(): boolean {
    const { clearable, readOnly } = this.props;
    const { isInputType, focused, value } = this.state;
    return isInputType && clearable && !readOnly && focused && ((value as unknown) as string) !== '' && isDef(value);
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
      return (this.inputRef.current as any).getValue();
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

  private onFocus(): void {
    this.setState({ focused: true });
  }

  private onBlur(): void {
    this.setState({ focused: false }, () => {
      this.validateWithTrigger('blur').then((msg) => {
        msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
      });
    });
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
      this.setState(
        { showPopup: false, popupValue: this.formatReturnValue((this.inputRef.current as any).getValue()) },
        () => {
          this.validateWithTrigger('change').then((msg) => {
            msg === NO_MATCHED_RULE_FLAG || this.setState({ validateMessage: msg || '' });
          });
          onClosePopup && onClosePopup(this, confirm);
          onChange && onChange(this.getValue());
        },
      );
    } else {
      this.setState({ showPopup: false }, () => {
        onClosePopup && onClosePopup(this, confirm);
      });
    }
  }

  private onPopupControlClick(evt: React.MouseEvent): void {
    if (this.isPopup && !this.props.disabled) {
      const target = evt.target as HTMLElement;
      const field = closest(target, '.pant-field', true);
      if (
        field &&
        field.querySelector('.pant-field__body') === this.bodyRef.current &&
        !closest(target, '.pant-popup, .pant-overlay', true)
      ) {
        this.openPopup();
      }
    }
  }

  private clearInput(): void {
    const value: any = '';
    this.setState({ value });
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

  private formatDisplayValue(value: any): string {
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
    const { type, name, inputAlign, children } = props;
    const { showPopup, popupValue, isInputType, value } = this.state;

    if (this.isCustomChild()) {
      const childrenWithProps = [].concat(children).map((child, index) => {
        const isPopup = (this.isPopup = child.type.__PANT_NAME__ === 'Popup');
        return React.cloneElement(child, {
          key: index,
          ref: this.inputRef,
          onChange: this.onCustomChange.bind(this, child.props.onChange),
          show: isPopup ? showPopup : undefined,
          closePopup: isPopup ? this.closePopup : undefined,
        });
      });
      if (this.isPopup) {
        return (
          <React.Fragment>
            <input
              className={bem('control', [inputAlign, 'custom'])}
              value={this.formatDisplayValue(popupValue)}
              placeholder={props.placeholder}
              readOnly
            />
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
    const { disabled } = props;
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
        className={bem({
          error: this.showError,
          disabled: disabled,
          'min-height': props.type === 'textarea' && !props.autosize,
        })}
        titleClassName={bem('title')}
        valueClassName={bem('value')}
        onClick={(!disabled && onClick) || null}
      >
        <div ref={this.bodyRef} className={bem('body')}>
          {input}
          {this.showClear && <Icon name="clear" className={bem('clear')} onTouchStart={this.clearInput} />}
          {this.genRightIcon()}
          {props.button && <div className={bem('button')}>{props.button}</div>}
        </div>
        {this.genWordLimit()}
        {this.genMessage()}
      </Cell>
    );
  }
}
