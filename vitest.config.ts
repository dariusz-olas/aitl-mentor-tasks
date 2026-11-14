import { defineConfig } from "vitest/config";
import path from "path";
import os from "os";

const testDb = path.join(os.tmpdir(), `aitl-vitest-${process.pid}.json`);

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    pool: "forks",
    maxWorkers: 1,
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      AUTH_SECRET: "vitest-aitl-secret-16chars",
      AITL_DB_PATH: testDb,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
