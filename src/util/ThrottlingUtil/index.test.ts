import { ThrottlingUtil } from "./index"

class ThrottlingTest {
    constructor(delay: number) {
        this.execThrottled = ThrottlingUtil.throttle(this.exec, delay)
    }

    exec = (func: any) => {
        func()
    }

    execThrottled = ThrottlingUtil.throttle(this.exec)
}

const delay = (del: number) => new Promise((resolve) => setTimeout(resolve, del))

describe("ThrottlingUtil", () => {
    test("throttling with delay 0ms", async () => {
        const throttled = new ThrottlingTest(0)
        const callCount = 10
        let execCount = 0
        let returnCount = 0

        for (let i = 0; i < callCount; i++) {
            const ret = throttled.execThrottled(() => execCount++)
            if (ret !== null) {
                returnCount++
            }
        }

        expect(execCount).toBe(callCount)
        expect(returnCount).toBe(10)
    })

    test("throttling with delay 10ms", async () => {
        const throttled = new ThrottlingTest(20)
        const callCount = 5
        let execCount = 0
        let returnCount = 0

        for (let i = 0; i < callCount; i++) {
            const ret = throttled.execThrottled(() => execCount++)
            if (ret !== null) {
                returnCount++
            }

            await delay(7)
        }

        // Await the last throttled execution.
        await delay(20)

        expect(execCount).toBe(3)
        expect(returnCount).toBe(2)
    })
})
