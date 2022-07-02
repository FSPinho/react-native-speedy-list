import React, { useCallback, useState } from "react"
import { Button, ImageBackground, StyleSheet, Text, View } from "react-native"

import { SpeedyList } from "../../src/index"
import { generateRandomUsers } from "./utils/RandomUsersGenerator"

export const App = () => {
    const [columns, setColumns] = useState(1)
    const [users, setUsers] = useState(() => generateRandomUsers(2))

    const addColumn = useCallback(() => setColumns((curr) => Math.min(++curr, 5)), [])
    const removeColumn = useCallback(() => setColumns((curr) => Math.max(--curr, 1)), [])

    const addUser = useCallback(
        (index) =>
            setUsers(([...curr]) => {
                curr.splice(index, 0, ...generateRandomUsers(1))
                return curr
            }),
        []
    )

    const addUsers = useCallback(
        () =>
            setUsers(([...curr]) => {
                console.log("Adding more users...")
                if (curr.length < 100) curr.push(...generateRandomUsers(20))
                return curr
            }),
        []
    )

    const itemRenderer = useCallback(
        ({ item, index }) => {
            return (
                <ImageBackground style={styles.item} source={item.photo}>
                    <Text>
                        {index} - {item.name}
                    </Text>
                    <Button title={"ADD"} onPress={() => addUser(index)} />
                </ImageBackground>
            )
        },
        [addUser]
    )

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Button title={"REMOVE"} onPress={removeColumn} />
                <Button title={"ADD"} onPress={addColumn} />
                <Text>{columns} columns</Text>
            </View>
            <SpeedyList
                columns={columns}
                items={users}
                itemRenderer={itemRenderer}
                itemHeight={({ index }) => (index % 3 === 0 ? 128 : 192)}
                itemKey={"id"}
                onEndReached={addUsers}
                onEndReachedOffset={192}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: "column",
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    item: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
    },
    avatar: {
        width: 36,
        height: 36,
    },
})
