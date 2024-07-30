import { join as joinPath } from "node:path";
import { loadEnv } from "./load-env";

describe("loadEnv", () => {
  const originalCwd = process.cwd();

  beforeAll(() => {
    process.chdir(joinPath(__dirname, "..", "test"));
  });

  afterAll(() => {
    process.chdir(originalCwd);
  });

  it("load environment variables", async () => {
    await loadEnv("test");
    expect(process.env).toHaveProperty("NODE_ENV", "test");
    expect(process.env).toHaveProperty("WITHENV_COMMON_VAR", "foo");
    expect(process.env).toHaveProperty("WITHENV_OVERRIDDEN_VAR", "buzz");
    expect(process.env).toHaveProperty("WITHENV_REUSING_VAR", "foo-fizz");
  });

  it("supports alias", async () => {
    await loadEnv("testing");
    expect(process.env).toHaveProperty("NODE_ENV", "test");
  });
});
