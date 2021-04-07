import React from 'react';
import { Form as FinalForm, Field as FinalField } from 'react-final-form';
import { toast } from '../../toast';
import { Form } from '../../form';
import { Field } from '../../field';
import { Button } from '../../button';
import { CheckboxGroup } from '../../checkbox-group';
import { RadioGroup } from '../../radio-group';
import { Popup } from '../../popup';
import { Picker } from '../../picker';
import { columns1, columns3 } from '../../picker/demo/constant';
import { DatetimePicker } from '../../datetime-picker';
import { createBEM } from '../../utils/bem';
import { NavBar } from '../../demos/scripts/components/nav-bar';
import './index.scss';

const bem = createBEM('demo-form');

export class FormRouteComponent extends React.Component {
  render(): JSX.Element {
    return (
      <React.Fragment>
        <NavBar title="Form" type="form" />
        <div className={bem()}>
          <section>
            <h2>Basic Usage</h2>
            <Form<{ location: string }>
              onSubmit={(promise): void => {
                const t = toast({
                  message: 'Validating...',
                  overlay: true,
                  loading: true,
                });
                promise.then((res) => {
                  t.clear();
                  if (!res.ok) {
                    toast(res.message);
                  }
                });
              }}
            >
              <Field<string>
                defaultValue=""
                name="username"
                title="Username"
                placeholder="Username"
                rules={[
                  { pattern: 'required', message: 'Username is required', trigger: ['change'] },
                  async (value): Promise<string | void> => {
                    return new Promise((resolve) => {
                      setTimeout(resolve.bind(null, `${value} is used`), 2000);
                    });
                  },
                ]}
              ></Field>
              <Field<string>
                type="password"
                defaultValue=""
                name="password"
                title="Password"
                placeholder="Password"
                rules={[{ pattern: 'required', message: 'Password is required', trigger: ['change'] }]}
              ></Field>
              <div className={bem('submit')}>
                <Button nativeType="submit" type="info" block round>
                  Submit
                </Button>
              </div>
            </Form>
          </section>

          <section>
            <h2>Validate Rules</h2>
            <Form<{ location: string }>
              onSubmit={(promise): void => {
                const t = toast({
                  message: 'Validating...',
                  overlay: true,
                  loading: true,
                });
                promise.then((res) => {
                  t.clear();
                  if (!res.ok) {
                    toast(res.message);
                  }
                });
              }}
            >
              <Field<string>
                defaultValue=""
                name="a1"
                title="Label"
                placeholder="Use pattern"
                rules={[
                  { pattern: 'required', message: 'Required field', trigger: ['change', 'blur'] },
                  { pattern: /^a|^$/, message: 'Must be start with "a"', trigger: ['blur'] },
                ]}
              ></Field>
              <Field<string>
                defaultValue=""
                name="a2"
                title="Label"
                placeholder="Use validator"
                rules={[
                  {
                    validator: async (value): Promise<string | void> => {
                      return value ? '' : 'Required field';
                    },
                    trigger: ['change', 'blur'],
                  },
                  async (value): Promise<string | void> => {
                    return /^a|^$/.test(value) ? '' : 'Must be start with "a"';
                  },
                ]}
              ></Field>
              <Field<string>
                defaultValue=""
                name="a3"
                title="Label"
                placeholder="Use async validator"
                rules={[
                  {
                    validator: async (value): Promise<string | void> => {
                      if (!value) {
                        return;
                      }
                      const t = toast({
                        message: 'Validating...',
                        overlay: true,
                        loading: true,
                      });
                      return new Promise<string | void>((resolve) => {
                        setTimeout(resolve.bind(null, value !== 'gary' ? `${value} is used` : ''), 2000);
                      }).then((msg) => {
                        t.clear();
                        return msg;
                      });
                    },
                    trigger: ['blur'],
                  },
                ]}
              ></Field>
              <div className={bem('submit')}>
                <Button nativeType="submit" type="info" block round>
                  Submit
                </Button>
              </div>
            </Form>
          </section>

          <section>
            <h2>Field Type</h2>
            <Form<{ location: string }>
              onSubmit={(promise): void => {
                const t = toast({
                  message: 'Validating...',
                  overlay: true,
                  loading: true,
                });
                promise.then((res) => {
                  t.clear();
                  if (res.ok) {
                    toast({
                      message: JSON.stringify(res.data, null, 2),
                      textAlign: 'left',
                      duration: 10000,
                      clearOnClick: true,
                    });
                  } else {
                    toast(res.message);
                  }
                });
              }}
            >
              <Field<boolean>
                type="switch"
                defaultValue={true}
                inputAlign="right"
                name="switch"
                title="Switch"
                rules={[{ pattern: 'required', message: 'Required field', trigger: ['change'] }]}
              ></Field>
              <Field<boolean>
                type="checkbox"
                defaultValue={true}
                name="checkbox"
                title="Checkbox"
                rules={[{ pattern: 'required', message: 'Required field', trigger: ['change'] }]}
              ></Field>
              <Field<[]>
                name="checkbox-group"
                title="Checkbox Group"
                validateTrigger={['change']}
                rules={async (items): Promise<string> => {
                  return items.length === 0 ? 'Required field' : items.length > 2 ? 'Max select 2' : '';
                }}
              >
                <CheckboxGroup
                  shape="square"
                  options={['Checkbox a', 'Checkbox b', 'Checkbox c']}
                  defaultValue={['Checkbox a']}
                />
              </Field>
              <Field<[]>
                name="radio-group"
                title="Radio Group"
                validateTrigger={['change']}
                rules={async (value): Promise<string> => {
                  return value ? '' : 'Required field';
                }}
              >
                <RadioGroup direction="horizontal" options={['Radio a', 'Radio b']} />
              </Field>
              <Field<any[]> name="city" title="Picker" placeholder="Select city">
                <Popup round position="bottom" closeOnClickOverlay>
                  <Picker columns={columns1} />
                </Popup>
              </Field>
              <Field<Record<string, string>>
                name="location"
                title="Cascade"
                placeholder="Select Location"
                validateTrigger={['change']}
                rules={async (value): Promise<string> => {
                  return value ? '' : 'Required field';
                }}
                valueFormatter={(res): any => {
                  return {
                    province: res[0],
                    city: res[1],
                    district: res[2],
                  };
                }}
                displayValueFormatter={(value): string => {
                  const parts: string[] = [];
                  if (value.province) {
                    parts.push(value.province);
                    if (value.city) {
                      parts.push(value.city);
                      if (value.district) {
                        parts.push(value.district);
                      }
                    }
                  }
                  return parts.join('/');
                }}
              >
                <Popup round position="bottom" closeOnClickOverlay>
                  <Picker columns={columns3} cols={3} cascade={true} />
                </Popup>
              </Field>
              <Field<Date>
                name="datetime"
                title="Datetime"
                placeholder="Select Datetime"
                validateTrigger={['change']}
                rules={async (value): Promise<string> => {
                  return value ? '' : 'Required field';
                }}
                displayValueFormatter={(value): string => {
                  return value && value.toLocaleString();
                }}
              >
                <Popup round position="bottom" closeOnClickOverlay>
                  <DatetimePicker type="datetime" title="Select Datetime" seconds />
                </Popup>
              </Field>
              <div className={bem('submit')}>
                <Button nativeType="submit" type="info" block round>
                  Submit
                </Button>
              </div>
            </Form>
          </section>

          <section>
            <h2>React Final Form</h2>
            <FinalForm
              initialValuesEqual={() => true}
              initialValues={{
                switch: true,
                checkbox: true,
                'checkbox-group': [],
                input: 'Hello',
              }}
              onSubmit={(values: any): void => {
                toast({
                  message: JSON.stringify(values, null, 2),
                  textAlign: 'left',
                  duration: 10000,
                  clearOnClick: true,
                });
              }}
            >
              {({ handleSubmit }) => {
                return (
                  <form onSubmit={handleSubmit}>
                    <FinalField<boolean>
                      name="switch"
                      validateOnBlur
                      validateFields={[]}
                      validate={(value: boolean) => {
                        return !value ? 'Required field' : undefined;
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<boolean>
                          name={input.name}
                          onChange={input.onChange}
                          defaultValue={input.value}
                          type="switch"
                          inputAlign="right"
                          title="Switch"
                          errorMessage={meta.error}
                        ></Field>
                      )}
                    </FinalField>
                    <FinalField<boolean>
                      name="checkbox"
                      validateOnBlur
                      validateFields={[]}
                      validate={(value: boolean) => {
                        return !value ? 'Required field' : undefined;
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<boolean>
                          name={input.name}
                          onChange={input.onChange}
                          defaultValue={input.value}
                          type="checkbox"
                          title="Checkbox"
                          errorMessage={meta.error}
                        ></Field>
                      )}
                    </FinalField>
                    <FinalField<string[]>
                      name="checkbox-group"
                      validateOnBlur
                      validateFields={[]}
                      validate={(value: string[]) => {
                        return !value || value.length === 0 ? 'Required field' : value.length > 2 ? 'Max select 2' : '';
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<string[]>
                          name={input.name}
                          onChange={input.onChange}
                          title="Checkbox Group"
                          errorMessage={meta.error}
                        >
                          <CheckboxGroup
                            shape="square"
                            options={['Checkbox a', 'Checkbox b', 'Checkbox c']}
                            defaultValue={input.value}
                          />
                        </Field>
                      )}
                    </FinalField>
                    <FinalField<string>
                      name="radio-group"
                      validateOnBlur
                      validateFields={[]}
                      validate={(value: string) => {
                        return !value ? 'Required field' : '';
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<[]>
                          name={input.name}
                          onChange={input.onChange}
                          title="Radio Group"
                          errorMessage={meta.error}
                        >
                          <RadioGroup
                            direction="horizontal"
                            options={['Radio a', 'Radio b']}
                            defaultValue={input.value}
                          />
                        </Field>
                      )}
                    </FinalField>
                    <FinalField<string>
                      name="input"
                      validate={(value: string) => {
                        return !value ? 'Input is required' : undefined;
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<string>
                          name={input.name}
                          onChange={input.onChange}
                          defaultValue={input.value}
                          title="Input"
                          placeholder="Input something"
                          errorMessage={meta.error}
                        ></Field>
                      )}
                    </FinalField>
                    <FinalField<string>
                      name="city"
                      validate={(value: string) => {
                        return !value ? 'City is required' : undefined;
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<string>
                          name={input.name}
                          onChange={input.onChange}
                          title="Picker"
                          placeholder="Select city"
                          errorMessage={meta.error}
                        >
                          <Popup round position="bottom" closeOnClickOverlay>
                            <Picker columns={columns1} defaultValue={input.value} />
                          </Popup>
                        </Field>
                      )}
                    </FinalField>
                    <FinalField<string[]>
                      name="Location"
                      validate={(value: string[]) => {
                        return !value || !value.length ? 'Location is required' : undefined;
                      }}
                    >
                      {({ input, meta }) => (
                        <Field<string[]>
                          name={input.name}
                          onChange={input.onChange}
                          title="Cascade"
                          placeholder="Select Location"
                          errorMessage={meta.error}
                          displayValueFormatter={(value): string => {
                            return value.join('/');
                          }}
                        >
                          <Popup round position="bottom" closeOnClickOverlay>
                            <Picker columns={columns3} cols={3} cascade={true} defaultValue={input.value} />
                          </Popup>
                        </Field>
                      )}
                    </FinalField>
                    <div className={bem('submit')}>
                      <Button nativeType="submit" type="info" block round>
                        Submit
                      </Button>
                    </div>
                  </form>
                );
              }}
            </FinalForm>
          </section>
        </div>
      </React.Fragment>
    );
  }
}
