import { python, node, cpp, java } from "compile-run";

export async function executeCode(code, language) {
  if (language === "python") {
    return python.runSource(code);
  } else if (language === "javascript") {
    return node.runSource(code);
  } else if (language === "cpp") {
    return cpp.runSource(code);
  } else if (language === "java") {
    return java.runSource(code);
  } else {
    throw new Error("Unsupported language");
  }
}
