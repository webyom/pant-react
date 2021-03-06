import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../icon';
import { Popup } from '../../../popup';
import { PopupToolbar } from '../../../popup/toolbar';
import { Form } from '../../../form';
import { Field } from '../../../field';
import {
  DatetimePicker,
  DatetimePickerProps,
  DatetimeRange,
  DatetimeRangeProps,
  DatetimeType,
} from '../../../datetime-picker';
import { Cascader, CascaderProps } from '../../../cascader';
import { SearchablePicker, SearchablePickerProps } from '../../../searchable-picker';
import { createBEM } from '../../../utils/bem';
import { addClass, removeClass } from '../../../utils/dom';
import { i18n } from '../../../locale';
import { DataListAddon } from '../..';
import './index.scss';

export type FilterableColumn = {
  key: string;
  header: React.ReactNode;
  placeholder?: string;
  type?: 'input' | 'switch' | 'cascader' | 'searchable-picker' | 'datetime' | 'datetime-range';
  component?: React.PureComponent<CascaderProps | SearchablePickerProps | DatetimePickerProps | DatetimeRangeProps>;
  componentProps?: CascaderProps | SearchablePickerProps | DatetimePickerProps | DatetimeRangeProps;
};

export type FilterableOptions = {
  columns: FilterableColumn[];
  value?: Record<string, any>;
  filterButton?: JSX.Element;
  filterTitle?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onChange: (value: Record<string, any>) => void;
  onPopup?: (event: React.SyntheticEvent) => boolean;
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

function Filterable({
  columns = [],
  value = {},
  filterButton,
  filterTitle,
  cancelButtonText,
  confirmButtonText,
  onPopup,
  onChange,
}: FilterableOptions) {
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

  useEffect(() => {
    return () => {
      if (show) {
        removeClass(document.body, 'pant-overflow-hidden');
      }
    };
  }, [show]);

  return (
    <>
      <div className={bem()} onClick={onClick}>
        {filterButton || (
          <>
            <span>{i18n().filter}</span>
            <Icon name="filter-o" />
          </>
        )}
      </div>
      <Popup show={show} position="right" onClickClose={hide} style={{ width: '85%', height: '100%' }} lazyRender>
        <div className={bem('popup')}>
          <PopupToolbar className={bem('title')} title={filterTitle || i18n().filter} />
          <div className={bem('list')}>
            <Form<Record<string, any>>
              onSubmit={(promise): void => {
                promise.then((res) => {
                  onChange && onChange(res.data);
                });
              }}
            >
              {columns.map(
                ({ key, header, type = 'input', component: CustomComponent, componentProps = {}, placeholder }) => {
                  if (type === 'cascader') {
                    const Comp = ((CustomComponent as unknown) as typeof Cascader) || Cascader;
                    return (
                      <Field<string[][] | string[]>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        direction="column"
                        clearable
                        displayValueFormatter={(value): string => {
                          if (!value || !value.length) {
                            return '';
                          }

                          if (typeof value[0] === 'string') {
                            return value.join('/');
                          } else if (Array.isArray(value[0])) {
                            return (value as string[][]).map((item) => item.join('/')).join(', ');
                          }
                          return '';
                        }}
                      >
                        <Popup position="bottom" closeOnClickOverlay>
                          <Comp {...(componentProps as CascaderProps)} defaultValue={value[key]} />
                        </Popup>
                      </Field>
                    );
                  } else if (type === 'searchable-picker') {
                    const Comp = ((CustomComponent as unknown) as typeof SearchablePicker) || SearchablePicker;
                    return (
                      <Field<string | string[]>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        direction="column"
                        clearable
                        displayValueFormatter={(value): string => {
                          if (typeof value === 'string') {
                            return value;
                          } else if (Array.isArray(value)) {
                            return value && value.join(', ');
                          }
                          return '';
                        }}
                      >
                        <Popup position="bottom" closeOnClickOverlay>
                          <Comp {...(componentProps as SearchablePickerProps)} defaultValue={value[key]} />
                        </Popup>
                      </Field>
                    );
                  } else if (type === 'datetime') {
                    const Comp = ((CustomComponent as unknown) as typeof DatetimePicker) || DatetimePicker;
                    const props = componentProps as DatetimePickerProps;
                    const datetimeType = props.type || 'date';
                    return (
                      <Field<Date>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        direction="column"
                        clearable
                        displayValueFormatter={(value): string => {
                          return value && formatDatetime(value, datetimeType);
                        }}
                      >
                        <Popup position="bottom" closeOnClickOverlay>
                          <Comp {...props} defaultValue={value[key]} />
                        </Popup>
                      </Field>
                    );
                  } else if (type === 'datetime-range') {
                    const Comp = ((CustomComponent as unknown) as typeof DatetimeRange) || DatetimeRange;
                    const props = componentProps as DatetimeRangeProps;
                    const datetimeType = props.type || 'date';
                    return (
                      <Field<Date[]>
                        key={key}
                        name={key}
                        title={header}
                        placeholder={placeholder}
                        direction="column"
                        clearable
                        displayValueFormatter={(value): string => {
                          return (
                            value &&
                            value.length &&
                            `${formatDatetime(value[0], datetimeType)} ~ ${formatDatetime(value[1], datetimeType)}`
                          );
                        }}
                      >
                        <Comp {...props} defaultValue={value[key]} />
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
                      clearable
                      clearTrigger="always"
                      direction="column"
                    ></Field>
                  );
                },
              )}
              <button ref={submitBtnRef} type="submit" style={{ display: 'none' }}></button>
            </Form>
          </div>
          <PopupToolbar
            className={bem('footer')}
            onCancel={hide}
            onConfirm={confirm}
            cancelButtonText={cancelButtonText}
            confirmButtonText={confirmButtonText}
          />
        </div>
      </Popup>
    </>
  );
}
