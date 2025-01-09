import { python, node } from "compile-run";

export async function executeCode(code, language) {
  if (language === "python") {
    return python.runSource(code);
  } else if (language === "javascript") {
    return node.runSource(code);
  } else {
    throw new Error("Unsupported language");
  }
}
