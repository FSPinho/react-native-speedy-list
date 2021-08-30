/**
 * Shallow comparator.
 * */
export const equals = <T>(a: T, b: T): boolean => {
    if (
        a === null ||
        b === null ||
        ["number", "string", "boolean", "undefined"].includes(typeof a) ||
        ["number", "string", "boolean", "undefined"].includes(typeof b)
    ) {
        return a === b
    }

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)

    if (aKeys.length !== bKeys.length) {
        return false
    }

    for (const key of aKeys) {
        if ((a as any)[key] !== (b as any)[key]) {
            return false
        }
    }

    return true
}

export const ObjectUtil = {
    equals,
}
