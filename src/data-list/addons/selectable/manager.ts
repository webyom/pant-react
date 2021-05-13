import { toast } from '../../../toast';
import { i18n } from '../../../locale';
import { interpolate } from '../../../utils';
import { RecordKey, select } from '../../key-selector';

export class SelectableManager<T = Record<string, any>> {
  constructor(
    private records: T[] = [],
    private value: string[] = [],
    private recordKey: RecordKey<T>,
    private maxSelection: number = 9999,
    private maxSelectionMsg: string,
    private onChange: (value: string[]) => void,
  ) {}

  getValue(): string[] {
    return [...this.value];
  }

  hasKey(key: string): boolean {
    return this.value.includes(key);
  }

  toggle(key: string): void {
    const onChange = this.onChange;
    if (this.hasKey(key)) {
      onChange(this.value.filter((v) => v !== key));
    } else {
      const { maxSelection, maxSelectionMsg } = this;
      if (maxSelection === 1) {
        onChange([key]);
      } else if (maxSelection > this.value.length) {
        onChange([...this.value, key]);
      } else {
        toast(interpolate(maxSelectionMsg || i18n().maxSelection, [maxSelection]));
      }
    }
  }

  toggleAll(): void {
    const all = this.records.map(select(this.recordKey));
    const onChange = this.onChange;
    if (all.every((v) => this.value.includes(v))) {
      onChange([]);
    } else {
      onChange(all.slice(0, this.maxSelection));
    }
  }
}
