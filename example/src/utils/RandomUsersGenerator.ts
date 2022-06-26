import { useMemo } from "react"

import RandomNameGenerator from "./RandomNameGenerator"

export interface User {
    id: number
    name: string
    age: number
}

export function useRandomUsers(count: number): Array<User> {
    return useMemo(() => generateRandomUsers(count), [count])
}

export function generateRandomUsers(count: number): Array<User> {
    const users: Array<User> = []
    const names = RandomNameGenerator.generate(count)

    names.forEach((name) => {
        users.push({
            id: Math.round(Math.random() * 1000000000),
            age: Math.round(Math.random() * 100),
            name,
        })
    })

    return users
}
