import { RecyclableListProps } from "../RecyclableList/types"

export interface ColumnedRecyclableListProps<T> extends RecyclableListProps<T> {
    /**
     * If given, sets the amount of columns for each list row. The default is 1.
     * */
    columns?: number
}

export type PropMapper<T, K extends keyof RecyclableListProps<T>> = (
    prop: RecyclableListProps<T>[K]
) => RecyclableListProps<T[]>[K]
