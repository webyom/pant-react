import React, { useState, useRef } from 'react';
import { Icon } from '../../../icon';
import { Popup } from '../../../popup';
import { PopupToolbar } from '../../../popup/toolbar';
import { Form } from '../../../form';
import { Field } from '../../../field';
import { DatetimePicker, DatetimeRange, DatetimeType } from '../../../datetime-picker';
import { SearchPicker } from '../../../search-picker';
import { createBEM } from '../../../utils/bem';
import { addClass, removeClass } from '../../../utils/dom';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';
import './index.scss';

export type SelectionOption =
  | string
  | {
      [key: string]: any;
      label: string;
      value: string;
    };

export type FilterableColumn = {
  key: string;
  header: React.ReactNode;
  placeholder?: string;
  type?: 'input' | 'switch' | 'single-selection' | 'multiple-selection' | 'datetime' | 'datetime-range';
  datetimeType?: DatetimeType;
  labelKey?: string;
  valueKey?: string;
  options?: SelectionOption[];
  minDate?: Date;
  maxDate?: Date;
};

export type FilterableOptions = {
  columns?: FilterableColumn[];
  value?: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
  onPopup?: (event: React.SyntheticEvent) => any;
};

export function filterable(options: FilterableOptions): DataListAddon {
  return {
    onInjectToolbar: (render) => (props) => {
      return (
        <>
          {render(props)}
          <Filterable {...options} />
        </>
      );
    },
  };
}

const bem = createBEM('pant-data-list__filter');

function formatDatetime(date: Date, type: DatetimeType): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mm = date.getMinutes();
  const dd = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
  const tt = `${h < 10 ? '0' + h : h}:${mm < 10 ? '0' + mm : mm}`;
  if (type === 'datetime') {
    return dd + ' ' + tt;
  } else if (type === 'time') {
    return tt;
  } else {
    return dd;
  }
}

function Filterable({ columns = [], value = {}, onPopup, onChange }: FilterableOptions) {
  const submitBtnRef = useRef<HTMLButtonElement>();
  const [show, setShow] = useState(false);
  const onClick = (event: React.SyntheticEvent) => {
    if (onPopup && onPopup(event) === false) {
      return;
    }
    setShow(true);
    addClass(document.body, 'pant-overflow-hidden');
  };

  const hide = () => {
    removeClass(document.body, 'pant-overflow-hidden');
    setShow(false);
  };

  const confirm = () => {
    submitBtnRef.current.click();
    hide();
  };

  return (
    <>
      <div className={bem()} onClick={onClick}>
        <span>{i18n().filter}</span>
        <Icon name="filter-o" />
      </div>
      <Popup show={show} position="right" onClickClose={hide} style={{ width: '85%', height: '100%' }} lazyRender>
        <div className={bem('popup')}>
          <PopupToolbar title={i18n().filter} />
          <div className={bem('list')}>
            <Form<Record<string, any>>
              onSubmit={(promise): void => {
                promise.then((res) => {
                  onChange && onChange(res.data);
                });
              }}
            >
              {columns.map(
                ({
                  key,
                  header,
                  type = 'input',
                  labelKey,
                  valueKey,
                  options = [],
                  datetimeType = 'date',
                  minDate,
                  maxDate,
                  placeholder,
                }) => {
                  if (type === 'single-selection' || type === 'multiple-selection') {
                    return (
                      <Field<string | string[]>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        displayValueFormatter={(value): string => {
                          if (typeof value === 'string') {
                            return value;
                          } else if (Array.isArray(value)) {
                            return value && value.join(', ');
                          }
                          return '';
                        }}
                      >
                        <Popup round position="bottom" closeOnClickOverlay>
                          <SearchPicker
                            data={options}
                            defaultValue={value[key]}
                            valueKey={valueKey}
                            labelKey={labelKey}
                            maxSelection={type === 'single-selection' ? 1 : 999}
                          />
                        </Popup>
                      </Field>
                    );
                  } else if (type === 'datetime') {
                    return (
                      <Field<Date>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        displayValueFormatter={(value): string => {
                          return value && formatDatetime(value, datetimeType);
                        }}
                      >
                        <Popup round position="bottom" closeOnClickOverlay>
                          <DatetimePicker type={datetimeType} min={minDate} max={maxDate} defaultValue={value[key]} />
                        </Popup>
                      </Field>
                    );
                  } else if (type === 'datetime-range') {
                    return (
                      <Field<Date[]>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        displayValueFormatter={(value): string => {
                          return (
                            value &&
                            value.length &&
                            `${formatDatetime(value[0], datetimeType)} ~ ${formatDatetime(value[1], datetimeType)}`
                          );
                        }}
                      >
                        <DatetimeRange type={datetimeType} min={minDate} max={maxDate} defaultValue={value[key]} />
                      </Field>
                    );
                  } else if (type === 'switch') {
                    return (
                      <Field<boolean>
                        className="flex-direction-row"
                        type="switch"
                        inputAlign="right"
                        key={key}
                        defaultValue={value[key]}
                        name={key}
                        title={header}
                      ></Field>
                    );
                  }
                  return (
                    <Field<string>
                      key={key}
                      defaultValue={value[key]}
                      placeholder={placeholder}
                      name={key}
                      title={header}
                    ></Field>
                  );
                },
              )}
              <button ref={submitBtnRef} type="submit" style={{ display: 'none' }}></button>
            </Form>
          </div>
          <PopupToolbar onCancel={hide} onConfirm={confirm} />
        </div>
      </Popup>
    </>
  );
}
