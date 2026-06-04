#!/usr/bin/env node
/**
 * Verifica reglas básicas de imports FSD.
 */
import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import process from "node:process"

const ROOT = join(process.cwd(), "src")

const RULES = [
  {
    name: "store-no-components",
    roots: ["store"],
    forbidden: ["@/components/", "@/widgets/"],
  },
  {
    name: "entities-api-no-store",
    roots: ["entities"],
    forbidden: ["@/store/"],
    pathIncludes: "/api/",
  },
  {
    name: "entities-no-upper-layers",
    roots: ["entities"],
    forbidden: ["@/widgets/", "@/features/", "@/pages/"],
  },
  {
    name: "features-no-widgets",
    roots: ["features"],
    forbidden: ["@/widgets/", "@/pages/"],
  },
  {
    name: "features-no-components",
    roots: ["features"],
    forbidden: ["@/components/"],
    pathExcludes: ["/ui/"],
  },
  {
    name: "shared-no-upper-layers",
    roots: ["shared"],
    forbidden: [
      "@/entities/",
      "@/features/",
      "@/widgets/",
      "@/pages/",
      "@/store/",
      "@/components/",
    ],
  },
  {
    name: "api-no-store",
    roots: ["api"],
    forbidden: ["@/store/"],
  },
]

const IMPORT_RE = /from\s+["'](@\/[^"']+)["']/g

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "client") {
        continue
      }
      files.push(...(await walk(fullPath)))
      continue
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".gen.ts")) {
      files.push(fullPath)
    }
  }

  return files
}

function matchesRule(filePath, rule) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/")
  const inRoot = rule.roots.some(
    (root) => rel === root || rel.startsWith(`${root}/`),
  )
  if (!inRoot) {
    return false
  }
  if (rule.pathIncludes && !rel.includes(rule.pathIncludes)) {
    return false
  }
  if (rule.pathExcludes?.some((segment) => rel.includes(segment))) {
    return false
  }
  return true
}

async function main() {
  const files = await walk(ROOT)
  const violations = []

  for (const file of files) {
    const content = await readFile(file, "utf8")
    const rel = relative(ROOT, file).replace(/\\/g, "/")

    for (const rule of RULES) {
      if (!matchesRule(file, rule)) {
        continue
      }

      for (const match of content.matchAll(IMPORT_RE)) {
        const importPath = match[1]
        if (rule.forbidden.some((prefix) => importPath.startsWith(prefix))) {
          violations.push({
            rule: rule.name,
            file: rel,
            importPath,
          })
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log("check-fsd-imports: OK")
    return
  }

  console.error("check-fsd-imports: violations found\n")
  for (const violation of violations) {
    console.error(
      `  [${violation.rule}] ${violation.file} → ${violation.importPath}`,
    )
  }
  process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
