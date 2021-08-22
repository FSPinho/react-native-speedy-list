import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SpeedyList, SpeedyListItemMeta } from "react-native-speedy-list"

import { User } from "./types"

const USERS_COUNT = 20 * 1000

const App = () => {
    const [users, setUsers] = useState<Array<User>>([])
    const [selectedUsers, setSelectedUsers] = useState<Record<number, boolean>>()

    useEffect(() => {
        const _users = [] as Array<User>

        for (let i = 0; i < USERS_COUNT; i++) {
            _users.push({
                id: i,
                name: `User ${i}`,
                selected: false,
            })
        }

        setUsers(_users)
    }, [])

    const itemRenderer = useCallback(({ item }: SpeedyListItemMeta<User>) => {
        return (
            <View style={styles.item}>
                <Text>{item.name}</Text>
            </View>
        )
    }, [])

    return (
        <SpeedyList<User>
            items={users}
            itemRenderer={itemRenderer}
            itemHeight={42}
            itemKey={"id"}
            header={<Text>Speedy List</Text>}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
})

export default App
