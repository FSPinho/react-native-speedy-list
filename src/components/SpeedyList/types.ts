import React from "react"
import { ScrollViewProps, StyleProp, ViewStyle } from "react-native"

/**
 * Default value for the initial render batch count.
 * */
export const INITIAL_BATCH_SIZE = 8

/**
 * Default amount of recyclable items.
 * */
export const RECYCLABLE_ITEMS_COUNT = 32

/**
 * Delay in milliseconds between list updates.
 * */
export const RECYCLING_DELAY = 1000 / 30 // 30 FPS

/**
 * Function responsible for list items rendering.
 * */
export type SpeedyListItemRenderer<T> = (props: SpeedyListItemProps<T>) => React.ReactElement

/**
 * Defines a list item layout.
 * */
export interface SpeedyListItemLayout {
    top: number
    height: number
}

/**
 * Defines a list item props.
 * */
export interface SpeedyListItemProps<T> {
    item: T
    index: number
    height: number
}

/**
 * Used as a param type for the main methods.
 * */
export type SpeedyListItemMeta<T> = Omit<SpeedyListItemProps<T>, "height">

/**
 * Internally stores metadata about each item.
 * */
export interface SpeedyListItemInternalMeta<T> {
    key: string
    item: T
    index: number
    layout: SpeedyListItemLayout
    recyclableViewIndex: number | null
}

/**
 * Defines the list props.
 * */
export interface SpeedyListProps<T> {
    /**
     * List entries.
     * */
    items: Array<T>

    /**
     * Function to render a list item.
     * */
    itemRenderer: SpeedyListItemRenderer<T>

    /**
     * Value or function to define each list item height.
     * */
    itemHeight: number | ((meta: SpeedyListItemMeta<T>) => number)

    /**
     * Prop name or function to provide a unique key for the given item.
     * */
    itemKey: keyof T | ((meta: SpeedyListItemMeta<T>) => number | string)

    /**
     * Function to compare two entries.
     * */
    itemEquals: (a: T, b: T) => boolean

    /**
     * List header and footer elements.
     * */
    header?: React.ReactNode
    footer?: React.ReactNode

    /**
     * Initial render batch size.
     * */
    initialBatchSize: number

    /**
     * How many recyclable items to render.
     * */
    recyclableItemsCount: number

    /**
     * Delay between list updates.
     * */
    recyclingDelay: number

    /**
     * Props for the ScrollView component.
     * */
    scrollViewProps?: ScrollViewProps

    /**
     * Style overrides.
     * */
    headerStyle?: StyleProp<ViewStyle>
    contentStyle?: StyleProp<ViewStyle>
    footerStyle?: StyleProp<ViewStyle>

    /**
     * Enables debug logs.
     * */
    debug?: boolean
}
