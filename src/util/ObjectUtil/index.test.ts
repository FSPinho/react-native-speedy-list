import { ObjectUtil } from "./index"

describe("ObjectUtil", () => {
    test("equals with primitive types", async () => {
        expect(ObjectUtil.equals(10, 10)).toBeTruthy()
        expect(ObjectUtil.equals(10, 9)).toBeFalsy()
        expect(ObjectUtil.equals("ABC", "ABC")).toBeTruthy()
        expect(ObjectUtil.equals("ABC", "ABCD")).toBeFalsy()
    })

    test("equals with primitive arrays", async () => {
        expect(ObjectUtil.equals([10], [10])).toBeTruthy()
        expect(ObjectUtil.equals([10], [9])).toBeFalsy()
        expect(ObjectUtil.equals([10, 11], [10, 11])).toBeTruthy()
        expect(ObjectUtil.equals([10, 11], [11, 10])).toBeFalsy()
        expect(ObjectUtil.equals(["ABC"], ["ABC"])).toBeTruthy()
        expect(ObjectUtil.equals(["ABC"], ["ABCD"])).toBeFalsy()
    })

    test("equals with objects", async () => {
        expect(
            ObjectUtil.equals(
                {
                    a: 10,
                    b: 20,
                },
                {
                    b: 20,
                    a: 10,
                }
            )
        ).toBeTruthy()

        expect(
            ObjectUtil.equals(
                {
                    a: 10,
                    b: 20,
                },
                {
                    b: 10,
                    a: 20,
                }
            )
        ).toBeFalsy()

        expect(
            ObjectUtil.equals(
                {
                    a: {},
                },
                {
                    a: {},
                }
            )
        ).toBeFalsy()
    })
})
