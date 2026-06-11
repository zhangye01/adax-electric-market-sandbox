import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function runScriptFixture(scriptPath, files) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "adax-script-"));

  try {
    for (const [filePath, content] of Object.entries(files)) {
      const absolutePath = resolve(fixtureRoot, filePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, content);
    }

    return spawnSync(process.execPath, [resolve(repoRoot, scriptPath)], {
      cwd: fixtureRoot,
      encoding: "utf8"
    });
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

export function makeLines(count, line = "export const value = 1;") {
  return `${Array.from({ length: count }, () => line).join("\n")}\n`;
}
