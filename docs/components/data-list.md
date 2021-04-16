# DataList

### Import

```js
import { DataList } from 'pant-react/es/data-list';
```

## API

### Props<T = Record<string, any>>

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| columns * | Columns data | _DataListColumn[]_ | - |
| records * | Rows data | _T[]_ | - |
| recordKey | Key of record | _T extends Record<string, any> ? keyof T : string \| (record: T, recordIndex: number) => string_ | `index` |
| addons | Addon list | _DataListAddon[]_ | - |
| topTip | Tips shown on top of data list | _React.ReactNode_ | - |
