import React, { useCallback, useState } from "react"
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import BigList from "react-native-big-list"

import { SpeedyList } from "../../src/index"
import { generateRandomUsers, User } from "./utils/RandomUsersGenerator"

export const App = () => {
    const [usersSL, setSLUsers] = useState(() => generateRandomUsers(1000))
    const [usersFL, setFLUsers] = useState(() => generateRandomUsers(1000))
    const [usersBL, setBLUsers] = useState(() => generateRandomUsers(1000))

    const updateUser = useCallback((setUsers: typeof setSLUsers) => {
        return (user: User) =>
            setUsers(([...current]) => {
                current[user.id] = user
                return current
            })
    }, [])

    const itemHeight = useCallback((item: User) => {
        return 108 + item.age
    }, [])

    const itemRenderer = useCallback(
        (item: User, update: (user: User) => void) => {
            const height = itemHeight(item)
            return (
                <View style={[styles.item, { height }]}>
                    <View style={styles.itemInner}>
                        <Text numberOfLines={1} style={styles.itemTitle}>
                            {item.id}. {item.name}
                        </Text>
                        <Text style={styles.itemSubtitle}>{item.age} years</Text>
                        <View style={styles.itemActions}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => update({ ...item, age: item.age + 5 })}
                            >
                                <Text>Age+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => update({ ...item, age: item.age - 5 })}
                            >
                                <Text>Age-</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        },
        [itemHeight]
    )

    const listRenderer = useCallback((title, content) => {
        return (
            <View style={styles.list}>
                <View style={styles.header}>
                    <Text style={styles.itemTitle}>{title}</Text>
                </View>
                {content}
            </View>
        )
    }, [])

    return (
        <View style={styles.root}>
            {listRenderer(
                "SpeedyList",
                <SpeedyList
                    items={usersSL}
                    itemRenderer={({ item }) => itemRenderer(item, updateUser(setSLUsers))}
                    itemHeight={({ item }) => itemHeight(item)}
                    itemKey={"id"}
                />
            )}

            {listRenderer(
                "FlatList",
                <FlatList
                    data={usersFL}
                    renderItem={({ item }) => itemRenderer(item, updateUser(setFLUsers))}
                    keyExtractor={(item) => String(item.id)}
                />
            )}

            {listRenderer(
                "BigList",
                <BigList
                    data={usersBL}
                    renderItem={({ item }) => itemRenderer(item, updateUser(setBLUsers))}
                    itemHeight={(section: number, index: number) =>
                        typeof index === "number" ? itemHeight(usersBL[index]) : 0
                    }
                    keyExtractor={(item) => String(item.id)}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        flexDirection: "row",
        alignItems: "stretch",
        backgroundColor: "#DDD",
        marginTop: Platform.select({ ios: 44, default: 0 }),
    },
    header: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF",
        borderBottomWidth: 2,
        borderBottomColor: "#AAA",
        padding: 8,
    },
    list: {
        flex: 1,
    },
    item: {
        padding: 8,
    },
    itemInner: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 8,
        borderWidth: 2,
        borderColor: "#AAA",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    itemTitle: {
        fontSize: 20,
        fontWeight: "800",
    },
    itemSubtitle: {
        fontSize: 18,
        fontWeight: "300",
    },
    itemActions: {
        flexDirection: "row",
        marginTop: 16,
    },
    iconButton: {
        borderRadius: 24,
        backgroundColor: "#DDD",
        padding: 8,
        margin: 4,
    },
})
