import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const buildRoot = resolve(".test-build/src");

if (existsSync(buildRoot)) {
  for (const filePath of walk(buildRoot)) {
    if (!filePath.endsWith(".js")) continue;
    const original = readFileSync(filePath, "utf8");
    const next = original.replace(/(from\s+["'])(\.\.?\/[^"']+)(["'])/g, (_, prefix, specifier, suffix) => {
      return `${prefix}${resolveSpecifier(filePath, specifier)}${suffix}`;
    });
    if (next !== original) {
      writeFileSync(filePath, next);
    }
  }
}

function walk(dirPath) {
  const paths = [];
  for (const entry of readdirSync(dirPath)) {
    const entryPath = join(dirPath, entry);
    if (statSync(entryPath).isDirectory()) {
      paths.push(...walk(entryPath));
    } else {
      paths.push(entryPath);
    }
  }
  return paths;
}

function resolveSpecifier(filePath, specifier) {
  if (specifier.endsWith(".js")) return specifier;

  const basePath = resolve(dirname(filePath), specifier);
  if (existsSync(`${basePath}.js`)) {
    return `${specifier}.js`;
  }
  if (existsSync(join(basePath, "index.js"))) {
    const relativeIndexPath = relative(dirname(filePath), join(basePath, "index.js"));
    return relativeIndexPath.startsWith(".") ? relativeIndexPath : `./${relativeIndexPath}`;
  }
  return specifier;
}
