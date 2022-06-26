import { RecyclableListItemLayout, RecyclableListItemProps, RecyclableListItemRenderer } from "../RecyclableList/types"

export interface RecyclableItemProps<T> {
    itemRenderer?: RecyclableListItemRenderer<T>
    itemEquals: (a: T, b: T) => boolean
    itemProps: RecyclableListItemProps<T>
    layout: RecyclableListItemLayout
}

export type RecyclableItemState<T> = RecyclableItemProps<T>
