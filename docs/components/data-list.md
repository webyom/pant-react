# DataList

### Import

```js
import { DataList } from 'pant-react/es/data-list';
```

## API

### Props<T = Record<string, any>>

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| columns * | Columns data | _DataListColumn\<T\>[]_ | - |
| records * | Rows data | _T[]_ | - |
| recordKey | Key of record | _T extends Record<string, any> ? keyof T : string \| (record: T, recordIndex: number) => string_ | `index` |
| addons | Addon list | _DataListAddon[]_ | - |
| topTip | Tips shown on top of data list | _React.ReactNode_ | - |

### DataListColumn<T = Record<string, any>>

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| key * | Columns key, e.g `info.name` | _string_ | - |
| header * | Record label | _React.ReactNode \| ((column: DataListColumn\<T\>) => React.ReactNode)_ | - |
| render | Record value render. A default render will return the raw value find by `key` | _(options: RowRenderOptions\<T\>) => React.ReactNode_ | - |

### RowRenderOptions<T = Record<string, any>>

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| record * | Record data | _T_ | - |
| recordIndex * | Index of record | _number_ | - |
| column * | Column data | _DataListColumn\<T\>_ | - |
| columnIndex * | Index of column | _number_ | - |

### BatchActions Addon

#### BatchActionsOptions<T = Record<string, any>>

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| getActions * | Function returns action items | _(selectable: SelectableManager\<T\>) => BatchActionItem\<T\>[]_ | - |
| cancelText | Will show a cancel button in the popup action list if supplied | _string_ | - |

#### BatchActionItem<T = Record<string, any>> & ActionSheetItem

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| action * | Action performing function | _(selectable: SelectableManager\<T\>) => void_ | - |

#### SelectableManager<T = Record<string, any>>

| Method | Description | Type |
| --- | --- | --- |
| getValue | Return all selected record keys | _() => string[]_ |
| hasKey | Identify whether a record is selected | _(key: string) => boolean_ |
| toggle | Toggle a record selection status | _(key: string) => void_ |
| toggleAll | Select all records all deselect all records | _() => void_ |
