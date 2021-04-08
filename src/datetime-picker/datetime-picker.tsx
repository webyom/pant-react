import React from 'react';
import { Picker, StandardColumnItem, PickerProps } from '../picker';
import { createBEM } from '../utils/bem';
import './index.scss';

export type DatetimePickerProps = Pick<PickerProps, 'showToolbar' | 'toolbarPosition'> & {
  type: 'date' | 'datetime' | 'time';
  seconds?: boolean;
  min?: Date;
  max?: Date;
  defaultValue?: Date;
  title?: string;
  prefixZero?: boolean;
  seperator?: boolean;
  formatter?: (text: string, type: 'y' | 'm' | 'd' | 'h' | 'mm' | 's') => string;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: Date) => void;
  onConfirm?: (value: Date) => void;
  onCancel?: () => void;
};

type DatetimePickerState = {
  columns: StandardColumnItem[][];
  pickerValue: string[];
};

const bem = createBEM('pant-datetime-picker');

function getDefaultMinMax(max?: boolean): Date {
  const now = new Date();
  const nowYear = now.getFullYear();
  return max ? new Date(nowYear + 5, 11, 31, 23, 59, 59) : new Date(nowYear - 5, 0, 1, 0, 0, 0);
}

export class DatetimePicker extends React.Component<DatetimePickerProps, DatetimePickerState> {
  static defaultProps = {
    showToolbar: true,
    toolbarPosition: 'top',
    seconds: false,
    prefixZero: true,
    seperator: true,
    formatter: (text: string): string => text,
    min: getDefaultMinMax(),
    max: getDefaultMinMax(true),
  };

  constructor(props: DatetimePickerProps) {
    super(props);
    const pickerValue = this.genInitPickerValue();
    this.state = {
      columns: this.genColumns(pickerValue),
      pickerValue: pickerValue,
    };
    this.onChange = this.onChange.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  getValue(): Date {
    const { type, seconds } = this.props;
    const { pickerValue } = this.state;
    if (!pickerValue.length) {
      return null;
    }

    if (type === 'time') {
      const [h, mm, s] = pickerValue.map((v) => parseInt(v));
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mm, seconds ? s : 0);
    } else {
      const [y, m, d, h, mm, s] = pickerValue.map((v) => parseInt(v));
      if (type === 'datetime') {
        return new Date(y, m, d, h, mm, seconds ? s : 0);
      } else {
        return new Date(y, m, d);
      }
    }
  }

  range(start: number, end: number): number[] {
    if (start > end) {
      return [];
    }
    const res = [];
    for (let i = start; i <= end; i++) {
      res.push(i);
    }
    return res;
  }

  prefixZero(n: string | number): string {
    if (this.props.prefixZero && n < 10) {
      return '0' + n;
    }
    return '' + n;
  }

  getMonthDays(year: string | number, month: string | number): number {
    if (typeof year === 'string') {
      year = parseInt(year);
    }

    if (typeof month === 'string') {
      month = parseInt(month);
    }

    if (month === 1) {
      if (year % 100 === 0) {
        if ((year / 100) % 4 === 0) {
          return 29;
        } else {
          return 28;
        }
      } else if (year % 4 === 0) {
        return 29;
      } else {
        return 28;
      }
    } else if ([0, 2, 4, 6, 7, 9, 11].includes(month)) {
      return 31;
    } else {
      return 30;
    }
  }

  genTimePickerColumns(pickerValue: string[]): StandardColumnItem[][] {
    const { min, max, seconds, formatter } = this.props;
    const minH = min.getHours();
    const minMM = min.getMinutes();
    const minS = min.getSeconds();
    const maxH = max.getHours();
    const maxMM = max.getMinutes();
    const maxS = max.getSeconds();
    let pickH, pickMM;
    if (pickerValue.length) {
      [pickH, pickMM] = pickerValue.map((s) => parseInt(s));
    } else {
      [pickH, pickMM] = [minH, minMM];
    }
    const res = [];
    res.push(
      this.range(minH, maxH).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 'h') })),
    );

    let minV: number, maxV: number;
    if (pickH === minH) {
      minV = minMM;
      if (pickH === maxH) {
        maxV = maxMM;
      } else {
        maxV = 59;
      }
    } else if (pickH === maxH) {
      minV = 0;
      maxV = maxMM;
    } else {
      minV = 0;
      maxV = 59;
    }
    res.push(
      this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 'mm') })),
    );

    if (seconds) {
      if (pickH === minH && pickMM === minMM) {
        minV = minS;
        if (pickH === maxH && pickMM === maxMM) {
          maxV = maxS;
        } else {
          maxV = 59;
        }
      } else if (pickH === maxH && pickMM === maxMM) {
        minV = 0;
        maxV = maxS;
      } else {
        minV = 0;
        maxV = 59;
      }
      res.push(
        this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 's') })),
      );
    }

    return res;
  }

  genColumns(pickerValue: string[]): StandardColumnItem[][] {
    const { type, min, max, seconds, formatter } = this.props;
    if (type === 'time') {
      return this.genTimePickerColumns(pickerValue);
    }
    const minY = min.getFullYear();
    const minM = min.getMonth();
    const minD = min.getDate();
    const minH = min.getHours();
    const minMM = min.getMinutes();
    const minS = min.getSeconds();
    const maxY = max.getFullYear();
    const maxM = max.getMonth();
    const maxD = max.getDate();
    const maxH = max.getHours();
    const maxMM = max.getMinutes();
    const maxS = max.getSeconds();
    let pickY, pickM, pickD, pickH, pickMM;
    if (pickerValue.length) {
      [pickY, pickM, pickD, pickH, pickMM] = pickerValue.map((s) => parseInt(s));
    } else {
      [pickY, pickM, pickD, pickH, pickMM] = [minY, minM, minD, minH, minMM];
    }
    const res = [];
    res.push(this.range(minY, maxY).map((item) => ({ value: item + '', label: formatter(item + '', 'y') })));

    let minV: number, maxV: number;
    if (pickY === minY) {
      minV = minM;
      if (pickY === maxY) {
        maxV = maxM;
      } else {
        maxV = 11;
      }
    } else if (pickY === maxY) {
      minV = 0;
      maxV = maxM;
    } else {
      minV = 0;
      maxV = 11;
    }
    res.push(
      this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item + 1), 'm') })),
    );

    if (pickY === minY && pickM === minM) {
      minV = minD;
      if (pickY === maxY && pickM === maxM) {
        maxV = maxD;
      } else {
        maxV = this.getMonthDays(pickY, pickM);
      }
    } else if (pickY === maxY && pickM === maxM) {
      minV = 1;
      maxV = maxD;
    } else {
      minV = 1;
      maxV = this.getMonthDays(pickY, pickM);
    }
    res.push(
      this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 'd') })),
    );

    if (type === 'datetime') {
      if (pickY === minY && pickM === minM && pickD === minD) {
        minV = minH;
        if (pickY === maxY && pickM === maxM && pickD === maxD) {
          maxV = maxH;
        } else {
          maxV = 23;
        }
      } else if (pickY === maxY && pickM === maxM && pickD === maxD) {
        minV = 0;
        maxV = maxH;
      } else {
        minV = 0;
        maxV = 23;
      }
      res.push(
        this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 'h') })),
      );

      if (pickY === minY && pickM === minM && pickD === minD && pickH === minH) {
        minV = minMM;
        if (pickY === maxY && pickM === maxM && pickD === maxD && pickH === maxH) {
          maxV = maxMM;
        } else {
          maxV = 59;
        }
      } else if (pickY === maxY && pickM === maxM && pickD === maxD && pickH === maxH) {
        minV = 0;
        maxV = maxMM;
      } else {
        minV = 0;
        maxV = 59;
      }
      res.push(
        this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 'mm') })),
      );

      if (seconds) {
        if (pickY === minY && pickM === minM && pickD === minD && pickH === minH && pickMM === minMM) {
          minV = minS;
          if (pickY === maxY && pickM === maxM && pickD === maxD && pickH === maxH && pickMM === maxMM) {
            maxV = maxS;
          } else {
            maxV = 59;
          }
        } else if (pickY === maxY && pickM === maxM && pickD === maxD && pickH === maxH && pickMM === maxMM) {
          minV = 0;
          maxV = maxS;
        } else {
          minV = 0;
          maxV = 59;
        }
        res.push(
          this.range(minV, maxV).map((item) => ({ value: item + '', label: formatter(this.prefixZero(item), 's') })),
        );
      }
    }

    return res;
  }

  genInitPickerValue(): string[] {
    const { type, min, max, seconds, defaultValue } = this.props;
    if (min > max) {
      throw new Error('min must not be greater than max');
    }
    let date: Date;
    let defaultDate = defaultValue;
    if (type === 'time' && defaultValue) {
      defaultDate = new Date(
        min.getFullYear(),
        min.getMonth(),
        min.getDate(),
        defaultValue.getHours(),
        defaultValue.getMinutes(),
        defaultValue.getSeconds(),
      );
    }

    if (defaultDate && defaultDate >= min && defaultDate <= max) {
      date = defaultDate;
    } else {
      return [];
    }
    const res = [];
    if (type === 'date' || type === 'datetime') {
      res.push(date.getFullYear() + '');
      res.push(date.getMonth() + '');
      res.push(date.getDate() + '');
    }

    if (type === 'datetime' || type === 'time') {
      res.push(date.getHours() + '');
      res.push(date.getMinutes() + '');
      if (seconds) {
        res.push(date.getSeconds() + '');
      }
    }
    return res;
  }

  onChange(pickerValue: string[]): void {
    const columns = this.genColumns(pickerValue);
    const newPickerValue = pickerValue.map((v, i) => {
      const val = parseInt(v);
      const column = columns[i];
      const min = parseInt(column[0].value);
      const max = parseInt(column[column.length - 1].value);
      if (val < min) {
        return min + '';
      } else if (val > max) {
        return max + '';
      } else {
        return val + '';
      }
    });
    this.setState(
      {
        columns,
        pickerValue: newPickerValue,
      },
      () => {
        const { onChange } = this.props;
        onChange && onChange(this.getValue());
      },
    );
  }

  onConfirm(): void {
    const newPickerValue = [...this.state.pickerValue];
    this.state.columns.forEach((item: StandardColumnItem[], index: number) => {
      if (item && item.length) {
        if (typeof newPickerValue[index] === 'undefined') {
          newPickerValue[index] = item[0].value;
        }
      }
    });
    this.setState({ pickerValue: newPickerValue }, () => {
      const { closePopup, onConfirm } = this.props;
      closePopup && closePopup(true);
      onConfirm && onConfirm(this.getValue());
    });
  }

  onCancel(): void {
    const { closePopup, onCancel } = this.props;
    closePopup && closePopup();
    onCancel && onCancel();
  }

  render(): JSX.Element {
    const { type, title, seconds, seperator, showToolbar, toolbarPosition } = this.props;
    const { columns, pickerValue } = this.state;
    return (
      <div className={bem([type, { seconds, seperator }])}>
        <Picker
          showToolbar={showToolbar}
          toolbarPosition={toolbarPosition}
          title={title}
          columns={columns}
          defaultValue={pickerValue}
          cols={columns.length}
          onChange={this.onChange}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
        />
      </div>
    );
  }
}
