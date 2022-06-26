import React, { useCallback, useState } from "react"
import { Button, Image, StyleSheet, Text, View } from "react-native"

import { SpeedyList } from "../../src/index"
import { generateRandomUsers } from "./utils/RandomUsersGenerator"

export const App = () => {
    const [columns, setColumns] = useState(1)
    const [users, setUsers] = useState(() => generateRandomUsers(1000))

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

    const itemRenderer = useCallback(
        ({ item, index }) => {
            return (
                <View style={styles.item}>
                    <Image style={styles.avatar} source={require("./assets/user.png")} />
                    <Text>
                        {index} - {item.name}
                    </Text>
                    <Button title={"ADD"} onPress={() => addUser(index)} />
                </View>
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
            <SpeedyList columns={columns} items={users} itemRenderer={itemRenderer} itemHeight={128} itemKey={"id"} />
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
