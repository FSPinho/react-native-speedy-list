import { StyleProp, ViewStyle } from "react-native"

import { RecyclableListProps } from "../RecyclableList/types"

export interface ColumnedRecyclableListProps<T> extends RecyclableListProps<T> {
    /**
     * If given, sets the amount of columns for each list row. The default is 1.
     * */
    columns?: number

    /**
     * Style overrides.
     * */
    rowStyle?: StyleProp<ViewStyle>
    cellStyle?: StyleProp<ViewStyle>
}

export type PropMapper<T, K extends keyof RecyclableListProps<T>> = (
    prop: RecyclableListProps<T>[K]
) => RecyclableListProps<T[]>[K]
