import React from "react"
import {
    Dimensions,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    View,
} from "react-native"

import { ObjectUtil } from "../../util/ObjectUtil"
import { ThrottlingUtil } from "../../util/ThrottlingUtil"
import { RecyclableItem } from "../RecyclableItem"
import {
    INITIAL_BATCH_SIZE,
    RECYCLABLE_ITEMS_COUNT,
    RecyclableListItemInternalMeta,
    RecyclableListProps,
    RECYCLING_DELAY,
} from "./types"

export class RecyclableList<T = any> extends React.Component<RecyclableListProps<T>> {
    public static defaultProps = {
        itemEquals: ObjectUtil.equals,
        recyclingDelay: RECYCLING_DELAY,
        initialBatchSize: INITIAL_BATCH_SIZE,
        recyclableItemsCount: RECYCLABLE_ITEMS_COUNT,
        onEndReachedOffset: 0,
    }

    /**
     * True after the first render.
     * */
    rendered = false

    /**
     * Used to dynamic calculate the recycled height.
     * */
    windowHeight = 0

    /**
     * Auto updated using header view onLayout.
     * */
    headerHeight = 0

    /**
     * Sum of all items heights.
     * */
    itemsHeightSum = 0

    /**
     * Mean item height.
     * */
    meanItemHeight = 0

    /**
     * Current scroll position.
     * */
    scrollY = 0

    /**
     * Current scrolling speed.
     * */
    scrollSpeed = 0.0

    /**
     * Scroll layout info.
     * */
    scrollHeight = 0
    scrollContentHeight = 0
    lastOnEndReachedContentHeight = 0

    /**
     * Amount of recyclable items. It should be enough to cover
     * at least two times the screen size, in order to avoid blank
     * spaces when scrolling.
     * */
    recyclableViewCount = 0

    /**
     * Dictionary of indexes and refs for each recycled view.
     * */
    recyclableRefsDict = {} as Record<number, RecyclableItem<T> | null>

    /**
     * Current items as a dictionary and as a list for ease access.
     * */
    itemsDict = {} as Record<string, RecyclableListItemInternalMeta<T>>
    itemsList = [] as Array<RecyclableListItemInternalMeta<T>>

    itemCount = 0

    /**
     * Helper to show debug logs.
     * */
    _debug = (...args: Array<any>): void => {
        if (this.props.debug) {
            console.log(args.length ? "SpeedyList -" : "SpeedyList", ...args)
        }
    }

    constructor(props: RecyclableListProps<T>) {
        super(props)

        this._debug("constructor")

        // Updating metadata based on the initial props.
        this._updateMeta()

        // Already executed by the first render.
        // this._updateContentThrottled();
    }

    shouldComponentUpdate(nextProps: Readonly<RecyclableListProps<T>>): boolean {
        let shouldUpdate = false

        if (this.props.itemHeight !== nextProps.itemHeight) {
            this._debug("shouldComponentUpdate: itemHeight diff")

            shouldUpdate = true
        }

        if (this.props.itemRenderer !== nextProps.itemRenderer) {
            this._debug("shouldComponentUpdate: itemRenderer diff")

            shouldUpdate = true
        }

        if (this.props.debug !== nextProps.debug) {
            this._debug("shouldComponentUpdate: debug diff")

            shouldUpdate = true
        }

        // Updating if the items changed.
        if (this.props.items.length !== nextProps.items.length) {
            this._debug(`shouldComponentUpdate: Length diff ${this.props.items.length} vs ${nextProps.items.length}`)
            shouldUpdate = true
        } else if (typeof nextProps.itemEquals === "function") {
            let index = 0
            for (const item of this.props.items) {
                if (!nextProps.itemEquals(item, nextProps.items[index])) {
                    this._debug("shouldComponentUpdate: Items diff at:", index)
                    shouldUpdate = true
                    break
                }
                index++
            }
        }

        // Updating metadata before the next render.
        if (shouldUpdate) {
            this._updateMeta(nextProps)
        }

        // Updating if height value changed.
        return shouldUpdate
    }

    /**
     * Updating recycled views each list update.
     * */
    componentDidUpdate(): void {
        this._updateContentThrottled()
    }

    /**
     * Returns the recycled views.
     * */
    _getContent = (): Array<React.ReactElement> => {
        const { itemEquals, itemRenderer, recyclingDelay, initialBatchSize } = this.props
        const content = [] as Array<React.ReactElement>

        for (let index = 0; index < this.recyclableViewCount; index++) {
            const { item, layout } = this.itemsList[index]
            content.push(
                <RecyclableItem<T>
                    ref={(ref) => (this.recyclableRefsDict[index] = ref)}
                    key={index}
                    layout={layout}
                    itemProps={{
                        item,
                        index,
                        height: layout.height,
                    }}
                    itemRenderer={index < initialBatchSize ? itemRenderer : undefined}
                    itemEquals={itemEquals}
                />
            )
        }

        if (!this.rendered) {
            let limit = initialBatchSize

            const _renderContent = (): void => {
                if (this.recyclableRefsDict[this.recyclableViewCount - 1]) {
                    limit += initialBatchSize
                    this._updateContentThrottled(limit)
                }

                if (limit < this.recyclableViewCount) {
                    setTimeout(_renderContent, recyclingDelay)
                }
            }
            setTimeout(() => {
                _renderContent()
            }, recyclingDelay)
        }

        return content
    }

    /**
     * Returns which items should be
     * currently recycled.
     * */
    _getRecycledItems = (limit = Infinity): Array<RecyclableListItemInternalMeta<T>> => {
        const recycledItems = [] as Array<RecyclableListItemInternalMeta<T>>

        // Scroll direction info.
        const goingUp = this.scrollSpeed < -1
        const goingDown = this.scrollSpeed > 1
        const stationary = !goingUp && !goingDown

        const recycledHeight = this.meanItemHeight * this.recyclableViewCount
        const heightDiff = recycledHeight - this.windowHeight
        const heightDiffHalf = heightDiff / 2

        const topEdgeY = stationary ? -heightDiffHalf : goingDown ? -heightDiffHalf / 2.0 : (-heightDiff * 3.0) / 4.0
        const bottomEdgeY = topEdgeY + recycledHeight

        for (let i = 0; i < Math.min(this.recyclableViewCount, limit); i++) {
            let itemIndex = i
            let itemMeta = this.itemsList[itemIndex]
            let middle = itemMeta.layout.top + itemMeta.layout.height / 2.0 + this.headerHeight - this.scrollY

            while (itemIndex + this.recyclableViewCount < this.itemCount && middle < bottomEdgeY) {
                if (topEdgeY - itemMeta.layout.height / 2.0 < middle && middle < bottomEdgeY) {
                    break
                }

                itemIndex += this.recyclableViewCount
                itemMeta = this.itemsList[itemIndex]
                middle = itemMeta.layout.top + itemMeta.layout.height / 2.0 + this.headerHeight - this.scrollY
            }

            recycledItems.push(itemMeta)
        }

        return recycledItems
    }

    _validateItemRef = (
        items: Array<RecyclableListItemInternalMeta<T>>,
        item: RecyclableListItemInternalMeta<T>,
        refIndex: number
    ): boolean => {
        let refIndexAvailable = true

        const previousItems = items.filter((i) => i.index < item.index)
        for (const { index, recyclableViewIndex } of previousItems) {
            if (
                // Whether the current items have the same ref...
                String(recyclableViewIndex) === String(refIndex) &&
                // And the indexes are too near.
                item.index - index < this.recyclableViewCount
            ) {
                // Then, the current refIndex isn't available.
                refIndexAvailable = false
                break
            }
        }

        return refIndexAvailable
    }

    /**
     * Handle scroll changes.
     * */
    _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        this._debug("_onScroll")

        const { nativeEvent } = event

        this.scrollY = nativeEvent.contentOffset.y
        this.scrollSpeed = nativeEvent.velocity?.y || 0
        this._updateContentThrottled()
        this._checkOnEndReached()

        if (this.props.scrollViewProps?.onScroll) {
            this.props.scrollViewProps?.onScroll(event)
        }
    }

    /**
     * Watches scroll layout changes.
     * */
    _onScrollLayout = (event: LayoutChangeEvent): void => {
        this._debug("_onScrollLayout")

        const { nativeEvent } = event

        this.scrollHeight = nativeEvent.layout.height
        this._checkOnEndReached()

        if (this.props.scrollViewProps?.onLayout) {
            this.props.scrollViewProps?.onLayout(event)
        }
    }

    /**
     * Watches scroll content layout changes.
     * */
    _onScrollContentChange = (width: number, height: number): void => {
        this._debug("_onScrollContentChange")

        this.scrollContentHeight = height
        this._checkOnEndReached()
    }

    _checkOnEndReached = () => {
        const { scrollY, scrollHeight, scrollContentHeight } = this
        const { onEndReached, onEndReachedOffset } = this.props

        const endOffset = scrollContentHeight - scrollHeight - scrollY

        if (
            typeof onEndReached === "function" &&
            this.lastOnEndReachedContentHeight !== scrollContentHeight &&
            endOffset <= (onEndReachedOffset ?? 0.0)
        ) {
            this.lastOnEndReachedContentHeight = scrollContentHeight
            onEndReached()
        }
    }

    /**
     * Handles header layout changes.
     * */
    _onHeaderLayout = (event: LayoutChangeEvent): void => {
        this._debug("_onHeaderLayout")

        this.headerHeight = event.nativeEvent.layout.height
    }

    /**
     * Updates which ref should handle each list item.
     * */
    _updateRefs = (items: Array<RecyclableListItemInternalMeta<T>>): void => {
        this._debug("_updateRefs")

        // Temporary ref dict, maps each ref to the respective items.
        const refItemMap = {} as Record<number, Record<string, RecyclableListItemInternalMeta<T>>>

        items.forEach((item) => {
            if (item.recyclableViewIndex !== null) {
                if (!refItemMap[item.recyclableViewIndex]) {
                    refItemMap[item.recyclableViewIndex] = {}
                }
                refItemMap[item.recyclableViewIndex][item.key] = item
            }
        })

        for (const itemMeta of items) {
            // Checking if the existing ref is valid.
            if (
                itemMeta.recyclableViewIndex !== null &&
                this._validateItemRef(
                    Object.values(refItemMap[itemMeta.recyclableViewIndex]),
                    itemMeta,
                    itemMeta.recyclableViewIndex
                )
            ) {
                // If so, just skipping...
            } else {
                // Otherwise, looking for an available ref.
                for (let refIndex = 0; refIndex < this.recyclableViewCount; refIndex++) {
                    if (this._validateItemRef(Object.values(refItemMap[refIndex] ?? {}), itemMeta, refIndex)) {
                        // Updating temporary ref dict.
                        if (itemMeta.recyclableViewIndex !== null) {
                            delete refItemMap[itemMeta.recyclableViewIndex][itemMeta.key]
                        }
                        if (!refItemMap[refIndex]) {
                            refItemMap[refIndex] = {}
                        }
                        refItemMap[refIndex][itemMeta.key] = itemMeta

                        itemMeta.recyclableViewIndex = Number(refIndex)
                        break
                    }
                }
            }
        }
    }

    /**
     * Updates the list metadata.
     * */
    _updateMeta = (props?: RecyclableListProps<T>): void => {
        this._debug("_updateMeta")

        const { items, itemRenderer, itemHeight, itemKey, recyclableItemsCount, recyclingDelay } = props || this.props

        if (!items || typeof items.forEach !== "function") {
            throw new Error("RecyclableList: the prop 'items' requires a valid array.")
        }

        if (typeof itemRenderer !== "function") {
            throw new Error("RecyclableList: the prop 'itemRenderer' requires a valid function.")
        }

        if (typeof itemHeight !== "number" && typeof itemHeight !== "function") {
            throw new Error("RecyclableList: the prop 'itemHeight' requires a valid number or function.")
        }

        if (typeof itemKey !== "string" && typeof itemKey !== "function") {
            throw new Error("RecyclableList: the prop 'itemKey' requires a valid string or function.")
        }

        // Updating throttle delay
        this._updateContentThrottled = ThrottlingUtil.throttle(this._updateContent, recyclingDelay)

        let top = 0
        const seenKeys = [] as Array<String>
        const previousItemsDict = {
            ...this.itemsDict,
        }
        this.itemCount = items.length
        this.itemsDict = {}
        this.itemsList = []

        items.forEach((item, index) => {
            const key = typeof itemKey === "string" ? String(item[itemKey]) : String(itemKey({ item, index }))

            if (seenKeys.includes(key)) {
                console.warn(`SpeedyList: found two items with the same key '${key}'.`)
            }

            seenKeys.push(key)

            let height
            if (typeof itemHeight === "function") {
                height = itemHeight({ item: items[index], index })
            } else {
                height = itemHeight
            }

            const itemMeta = {
                key,
                item,
                index,
                layout: {
                    top,
                    height,
                },
                recyclableViewIndex: null,
            } as RecyclableListItemInternalMeta<T>
            this.itemsDict[key] = itemMeta
            this.itemsList.push(itemMeta)

            top += height
        })

        this.windowHeight = Dimensions.get("window").height
        this.itemsHeightSum = top
        this.meanItemHeight = top / items.length

        this.recyclableViewCount = Math.min(recyclableItemsCount, items.length)

        Object.values(this.itemsDict).forEach((item) => {
            const previousMeta = previousItemsDict[item.key]

            if (
                previousMeta &&
                previousMeta.recyclableViewIndex !== null &&
                previousMeta.recyclableViewIndex < this.recyclableViewCount
            ) {
                item.recyclableViewIndex = previousMeta.recyclableViewIndex
            }
        })
    }

    /**
     * Updating recycled views for the next
     * predicted scroll position.
     * */
    _updateContent = (limit = Infinity): void => {
        this._debug("_updateContent")

        const { itemEquals, itemRenderer } = this.props
        const recycledItems = this._getRecycledItems(limit)

        this._updateRefs(recycledItems)

        for (const itemMeta of recycledItems) {
            const ref = this.recyclableRefsDict[itemMeta.recyclableViewIndex ?? -1]

            if (!ref) {
                this._debug(
                    `Can't find ref at index: ${itemMeta.recyclableViewIndex}. ${
                        Object.values(this.recyclableRefsDict).length
                    } refs available.`
                )
            }

            if (ref) {
                ref.recycle({
                    itemEquals,
                    itemRenderer,
                    itemProps: {
                        index: itemMeta.index,
                        item: itemMeta.item,
                        height: itemMeta.layout.height,
                    },
                    layout: itemMeta.layout,
                })
            }
        }
    }

    // Throttling content updates to save performance.
    _updateContentThrottled = ThrottlingUtil.throttle(this._updateContent)

    render(): React.ReactElement {
        this._debug("render")

        const { scrollViewProps, header, headerStyle, footer, footerStyle, contentStyle } = this.props
        const contentHeightStyle = {
            height: this.itemsHeightSum,
        }

        const content = this._getContent()

        this.rendered = true

        return (
            <View style={styles.scrollWrapper}>
                <ScrollView
                    {...scrollViewProps}
                    style={[styles.scroll, scrollViewProps?.style]}
                    contentContainerStyle={[styles.scrollInner, scrollViewProps?.contentContainerStyle]}
                    scrollEventThrottle={RECYCLING_DELAY}
                    onScroll={this._onScroll}
                    onLayout={this._onScrollLayout}
                    onContentSizeChange={this._onScrollContentChange}
                >
                    <View style={[styles.header, headerStyle]} onLayout={this._onHeaderLayout}>
                        {header}
                    </View>
                    <View style={[styles.content, contentStyle, contentHeightStyle]}>{content}</View>
                    <View style={[styles.footer, footerStyle]}>{footer}</View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    scrollWrapper: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollInner: {
        flexGrow: 1,
    },
    header: {
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
    },
    footer: {
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
    },
    content: {
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
    },
    recyclableItem: {
        position: "absolute",
        left: 0,
        right: 0,
    },
    topLine: {
        position: "absolute",
        top: 0,
    },
    bottomLine: {
        position: "absolute",
        bottom: 0,
    },
})
