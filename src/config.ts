import { readFile, exists } from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";
import type { Spad } from "./command/spad";

const configPath = path.resolve(__dirname, "../config.yml");
const configLocalPath = path.resolve(__dirname, "../config.local.yml");
let config: {
  SpadMap: Record<string, Spad>;
};
export async function getConfig() {
  if (!config) {
    let filePath = configPath;
    if (await exists(configLocalPath)) {
      filePath = configLocalPath;
    }
    const buf = await readFile(filePath);
    config = yaml.parse(Buffer.from(buf).toString("utf8"));
  }

  return config;
}
