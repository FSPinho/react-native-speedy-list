import React from "react"
import { StyleSheet, View } from "react-native"

import { ObjectUtil } from "../../util/ObjectUtil"
import { RecyclableList } from "../RecyclableList"
import { INITIAL_BATCH_SIZE, RECYCLABLE_ITEMS_COUNT, RECYCLING_DELAY } from "../RecyclableList/types"
import { ColumnedRecyclableListProps, PropMapper } from "./types"

export class ColumnedRecyclableList<T = any> extends React.Component<ColumnedRecyclableListProps<T>> {
    public static defaultProps = {
        columns: 1,
        itemEquals: ObjectUtil.equals,
        recyclingDelay: RECYCLING_DELAY,
        initialBatchSize: INITIAL_BATCH_SIZE,
        recyclableItemsCount: RECYCLABLE_ITEMS_COUNT,
    }

    getNumberOfColumns = () => {
        const { columns } = this.props
        if (!columns || columns <= 1) {
            return 1
        }

        return columns
    }

    getColumnWidth = () => {
        const columns = this.getNumberOfColumns()
        return `${100.0 / columns}%`
    }

    getItems: PropMapper<T, "items"> = (items) => {
        const columns = this.getNumberOfColumns()
        const columnedItems = [] as ColumnedRecyclableListProps<T>["items"][]
        const rows = Math.ceil(items.length / columns)

        for (let i = 0; i < rows; i++) {
            columnedItems.push(items.slice(i * columns, i * columns + columns))
        }

        return columnedItems
    }

    getItemRenderer: PropMapper<T, "itemRenderer"> = (renderer) => {
        const width = this.getColumnWidth()
        const columns = this.getNumberOfColumns()
        return ({ item: items, index, height }) => (
            <View style={styles.row}>
                {items.map((item, i) => (
                    <View key={i} style={[styles.column, { width }]}>
                        {renderer({ item, height, index: index * columns + i })}
                    </View>
                ))}
            </View>
        )
    }

    getItemKey: PropMapper<T, "itemKey"> = (itemKey) => {
        return ({ item: items, index }) => {
            if (typeof itemKey === "string" || typeof itemKey === "number" || typeof itemKey === "symbol") {
                return String(items[0][itemKey])
            }
            return itemKey({ item: items[0], index })
        }
    }

    getItemHeight: PropMapper<T, "itemHeight"> = (itemHeight) => {
        if (typeof itemHeight === "number") {
            return itemHeight
        }
        return ({ item: items, index }) => Math.max(...items.map((item) => itemHeight({ item, index })))
    }

    getItemEquals: PropMapper<T, "itemEquals"> = (itemEquals) => {
        return (a, b) => a.every((aItem) => b.every((bItem) => itemEquals(aItem, bItem)))
    }

    render() {
        const { items, itemRenderer, itemKey, itemHeight, itemEquals, ...props } = this.props

        return (
            <RecyclableList<T[]>
                items={this.getItems(items)}
                itemRenderer={this.getItemRenderer(itemRenderer)}
                itemKey={this.getItemKey(itemKey)}
                itemHeight={this.getItemHeight(itemHeight)}
                itemEquals={this.getItemEquals(itemEquals)}
                {...props}
            />
        )
    }
}

const styles = StyleSheet.create({
    row: { flex: 1, flexDirection: "row" },
    column: { flex: 1 },
})
