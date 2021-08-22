import { SpeedyListItemLayout, SpeedyListItemProps, SpeedyListItemRenderer } from "../SpeedyList/types"

/**
 * Defines a list item wrapper props.
 * */
export interface SpeedyListRecyclableItemProps<T> {
    itemRenderer?: SpeedyListItemRenderer<T>
    itemEquals: (a: T, b: T) => boolean
    itemProps: SpeedyListItemProps<T>
    layout: SpeedyListItemLayout
}

/**
 * Defines a list item wrapper state.
 * */
export type SpeedyListRecyclableItemState<T> = SpeedyListRecyclableItemProps<T>
