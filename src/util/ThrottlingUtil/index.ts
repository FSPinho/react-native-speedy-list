import { Func } from "./types"

const throttle = <R>(func: Func<R>, delay: number): Func<R | null> => {
    return func
}

export const ThrottlingUtil = {
    throttle,
}
