import { resolve as resolvePath } from "node:path";
import { findUp } from "./find-up";

describe("findUp", () => {
  it("find a file", async () => {
    const result = await findUp("package.json", { cwd: __dirname });
    expect(result).toBe(resolvePath("package.json"));
  });

  it("return undefined if not found", async () => {
    const result = await findUp("b45df746-e898-43c7-897e-15c54a607927", {
      cwd: __dirname,
    });
    expect(result).toBeUndefined();
  });
});
