import { describe, it, expect } from "vitest";

function sum(a: number, b: number) {
    return a + b;
}

describe("sum", () => {
    it("adds two numbers", () => {
        expect(sum(1, 2)).toBe(3);
    });
});
