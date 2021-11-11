/**
 * Example usage of the SpeedyList component against the standard FlatList.
 *
 * This example contains:
 * - A toggle so you can switch between SpeedyList and FlatList.
 * - A list of "users" where;
 *   - Each item contains an image and text;
 *   - Each item contains a button to add a random item below;
 *   - Each item contains a button to remove itself;
 *   - Each item contains a checkbox to mark it as selected.
 *
 * */

import React, { useCallback, useEffect, useState } from "react"
import { FlatList, Image, StyleSheet, Switch, Text, TouchableWithoutFeedback, View } from "react-native"

import { SpeedyList, SpeedyListItemMeta, SpeedyListItemRenderer } from "../../src/index"

// Simple type to define our list item.
export interface User {
    id: number
    name: string
}

// Amount of initial items in the example.
const INITIAL_USERS_COUNT = 2 * 1000

// Base height for each item.
const ITEM_HEIGHT = 48

export const App: React.FC = () => {
    // Toggles to FlatList.
    const [useFlatList, setUseFlatList] = useState(false)

    // List of example users.
    const [users, setUsers] = useState<Array<User>>([])

    // Dictionary mapping items ids to a boolean
    // telling whether the respective item is selected.
    const [selectedUsers, setSelectedUsers] = useState<Record<number, boolean>>({})

    // Toggles an item selection.
    const toggleSelection = useCallback((item: User) => {
        setSelectedUsers((current) => ({ ...current, [item.id]: !current[item.id] }))
    }, [])

    // Adds a random item below the given one.
    const addItemBelow = useCallback(
        (item: User) => {
            const _id = Math.round(Math.random() * 1000000)
            const _users = [...users]
            _users.splice(users.findIndex((it) => it.id === item.id) + 1, 0, { id: _id, name: `User ${_id}` })
            setUsers(_users)
        },
        [users]
    )

    // Removes the given item.
    const removeItem = useCallback(
        (item: User) => {
            setUsers(users.filter((it) => it.id !== item.id))
        },
        [users]
    )

    // Creating the initial items.
    useEffect(() => {
        const _users = [] as Array<User>

        for (let i = 0; i < INITIAL_USERS_COUNT; i++) {
            _users.push({
                id: i,
                name: `User ${i}`,
            })
        }

        setUsers(_users)
    }, [])

    // Example of conditional height.
    const itemHeight = useCallback(
        ({ item }: SpeedyListItemMeta<User>) => (item.id % 5 === 0 ? ITEM_HEIGHT * 2 : ITEM_HEIGHT),
        []
    )

    // Item comparator.
    // Note that we're including the selection state
    // here, so the list will update correctly.
    const itemEquals = useCallback(
        (a: User, b: User): boolean => {
            return a.id === b.id && selectedUsers[a.id] === selectedUsers[b.id]
        },
        [selectedUsers]
    )

    // Responsible to render each list item.
    // Important: don't use "key" prop here, as it
    // would kill the recycling purpose.
    const itemRenderer = useCallback<SpeedyListItemRenderer<User>>(
        ({ item, index }) => {
            const isSelected = selectedUsers[item.id]

            return (
                <TouchableWithoutFeedback onPress={() => toggleSelection(item)}>
                    <View style={styles.item}>
                        <Image style={styles.itemPhoto} source={require("./assets/user.png")} />

                        <Text style={styles.itemText}>
                            {item.name} ({index})
                        </Text>

                        <TouchableWithoutFeedback onPress={() => addItemBelow(item)}>
                            <View style={styles.itemBtn}>
                                <Text>Add</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback style={styles.itemBtn} onPress={() => removeItem(item)}>
                            <View style={styles.itemBtn}>
                                <Text>Remove</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <View style={isSelected ? styles.itemCheckboxSelected : styles.itemCheckbox} />
                    </View>
                </TouchableWithoutFeedback>
            )
        },
        [addItemBelow, removeItem, selectedUsers, toggleSelection]
    )

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Text>Switch To FlatList</Text>
                <Switch value={useFlatList} onValueChange={(value) => setUseFlatList(value)} />
            </View>

            {useFlatList ? (
                <FlatList
                    data={users}
                    renderItem={itemRenderer as any}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text>FlatList Header Example ({users.length} items)</Text>
                        </View>
                    }
                    ListFooterComponent={
                        <View style={styles.listFooter}>
                            <Text>FlatList Footer Example</Text>
                        </View>
                    }
                    stickyHeaderIndices={[0]}
                />
            ) : (
                <SpeedyList<User>
                    items={users}
                    itemRenderer={itemRenderer}
                    itemHeight={itemHeight}
                    itemEquals={itemEquals}
                    itemKey={"id"}
                    header={<Text>Speedy List Header Example ({users.length} items)</Text>}
                    footer={<Text>Speedy List Footer Example</Text>}
                    headerStyle={styles.listHeader}
                    footerStyle={styles.listFooter}
                    scrollViewProps={{
                        // Makes the header fixed.
                        stickyHeaderIndices: [0],
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: "column",
        alignItems: "stretch",
    },
    header: {
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    listHeader: {
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.12)",
        padding: 16,
    },
    listFooter: {
        backgroundColor: "white",
        padding: 16,
    },
    item: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.12)",
    },
    itemText: {
        flex: 1,
    },
    itemPhoto: {
        width: 24,
        height: 24,
        margin: 16,
    },
    itemBtn: {
        padding: 2,
        margin: 8,
        borderWidth: 1,
        borderRadius: 4,
    },
    itemCheckbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 4,
        margin: 16,
    },
    itemCheckboxSelected: {
        width: 24,
        height: 24,
        backgroundColor: "#607D8B",
        borderRadius: 4,
        margin: 16,
    },
})
