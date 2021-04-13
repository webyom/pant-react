import { RecordKey, select } from '../../key-selector';

export class SelectableManager<T = Record<string, any>> {
  constructor(
    private records: T[] = [],
    private value: string[] = [],
    private recordKey: RecordKey<T>,
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
      onChange([...this.value, key]);
    }
  }

  toggleAll(): void {
    const all = this.records.map(select(this.recordKey));
    const onChange = this.onChange;
    if (all.every((v) => this.value.includes(v))) {
      onChange([]);
    } else {
      onChange(all);
    }
  }
}
