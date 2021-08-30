import { Func } from "./types"

const throttle = <R>(func: Func<R>, delay = 0): Func<R | null> => {
    let lastTimestamp = 0
    let pending: any = null

    return (args) => {
        clearTimeout(pending)

        const timestamp = +new Date()

        if (timestamp - lastTimestamp >= delay) {
            lastTimestamp = timestamp
            return func(args)
        }

        pending = setTimeout(() => func(args), delay)

        return null
    }
}

export const ThrottlingUtil = {
    throttle,
}
