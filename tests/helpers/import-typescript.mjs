import { readFile } from "node:fs/promises";
import ts from "typescript";

const compiledModules = new Map();
let freshImport = 0;

async function moduleUrl(fileUrl, ancestors = new Set()) {
  const key = fileUrl.href;
  if (ancestors.has(key)) throw new Error(`Circular test module import: ${key}`);
  if (compiledModules.has(key)) return compiledModules.get(key);
  const source = await readFile(fileUrl, "utf8");
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    fileName: fileUrl.pathname,
  });
  const parsed = ts.createSourceFile(fileUrl.pathname, outputText, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  const replacements = [];
  for (const statement of parsed.statements) {
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith(".")) continue;
    const dependency = new URL(specifier.text, fileUrl);
    if (!/\.[cm]?[jt]sx?$/.test(dependency.pathname)) dependency.pathname += ".ts";
    const linkedUrl = await moduleUrl(dependency, new Set([...ancestors, key]));
    replacements.push({ start: specifier.getStart(parsed), end: specifier.end, text: JSON.stringify(linkedUrl) });
  }
  for (const replacement of replacements.reverse()) {
    outputText = outputText.slice(0, replacement.start) + replacement.text + outputText.slice(replacement.end);
  }
  const linked = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
  compiledModules.set(key, linked);
  return linked;
}

// A fresh root instance isolates storage's in-memory state between persistence tests.
export async function importTypeScriptModule(fileUrl, { fresh = false } = {}) {
  const linked = await moduleUrl(fileUrl);
  return import(fresh ? `${linked}#instance-${++freshImport}` : linked);
}
