import { useMemo, useState } from "react"

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

    names.forEach((name, id) => {
        users.push({
            id,
            name,
            age: Math.round(Math.random() * 100),
        })
    })

    return users
}
