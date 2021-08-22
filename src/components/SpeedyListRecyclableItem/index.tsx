import React from "react"
import { StyleSheet, View } from "react-native"

import { ObjectUtil } from "../../util/ObjectUtil"
import { SpeedyListRecyclableItemProps, SpeedyListRecyclableItemState } from "./types"

/**
 * Wrapper around each list item.
 * */
export class SpeedyListRecyclableItem<T> extends React.Component<
    SpeedyListRecyclableItemProps<T>,
    SpeedyListRecyclableItemState<T>
> {
    public static defaultProps = {
        itemEquals: ObjectUtil.equals,
    }

    /**
     * Current recyclable view ref.
     * */
    itemViewRef: View | null = null

    constructor(props: SpeedyListRecyclableItemProps<T>) {
        super(props)

        // The default state comes from the first props.
        this.state = { ...props }
    }

    /**
     * The list will call this function attempting
     * to update the current item.
     * */
    recycle = (props: SpeedyListRecyclableItemProps<T>): void => {
        this.setState(props)
    }

    shouldComponentUpdate(
        _: SpeedyListRecyclableItemProps<T>,
        nextState: Readonly<SpeedyListRecyclableItemState<T>>
    ): boolean {
        // Updating if the item index changed.
        if (this.state.itemProps.index !== nextState.itemProps.index) {
            return true
        }

        // Updating if the item renderer changed.
        if (this.state.itemRenderer !== nextState.itemRenderer) {
            return true
        }

        // Updating if the item itself changed.
        if (!nextState.itemEquals(this.state.itemProps.item, nextState.itemProps.item)) {
            return true
        }

        // If the item layout changed, we just need
        // to directly change the native props.
        if (this.state.layout.top !== nextState.layout.top || this.state.layout.height !== nextState.layout.height) {
            this.itemViewRef?.setNativeProps({
                ...nextState.layout,
            })
        }

        return false
    }

    render(): React.ReactElement {
        const { layout, itemProps, itemRenderer } = this.state

        return (
            <View ref={(ref) => (this.itemViewRef = ref)} style={[styles.recyclableItem, layout]}>
                {typeof itemRenderer === "function" && itemRenderer(itemProps)}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    recyclableItem: {
        position: "absolute",
        left: 0,
        right: 0,
    },
})
