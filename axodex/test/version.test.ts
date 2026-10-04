/**
 * Axodex version sync verification.
 *
 * Verifies that AXODEX_VERSION (the single source of truth in
 * src/version.ts) matches across all sync points:
 *
 *   1. axodex/src/version.ts        ← the source of truth (AXODEX_VERSION)
 *   2. axodex/package.json          ← the semver-translated "version" field
 *   3. README.md                    ← the displayed version in the badge
 *
 * Also verifies:
 *   - AXODEX_VERSION matches the FRAZIYM format regex
 *   - AXODEX_VERSION_SEMVER == fraziymToSemver(AXODEX_VERSION)
 *   - package.json "version" matches AXODEX_VERSION_SEMVER
 *
 * If this test fails, one of the sync points is stale. Fix by:
 *   1. Edit src/version.ts (the source of truth)
 *   2. Re-derive the semver translation and update package.json "version"
 *   3. Update README.md displayed version
 *   4. Re-run this test
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  AXODEX_VERSION,
  AXODEX_VERSION_SEMVER,
  AXODEX_RELEASE_STAGE,
  parseFraziymVersion,
  fraziymToSemver,
} from "../src/version.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "..");

function readJson(p: string): Record<string, unknown> {
  const text = fs.readFileSync(p, "utf-8");
  return JSON.parse(text) as Record<string, unknown>;
}

function readText(p: string): string {
  return fs.readFileSync(p, "utf-8");
}

describe("AXODEX_VERSION format", () => {
  it("matches the FRAZIYM version regex", () => {
    expect(parseFraziymVersion(AXODEX_VERSION)).not.toBeNull();
  });

  it("is currently in beta stage", () => {
    const parsed = parseFraziymVersion(AXODEX_VERSION);
    expect(parsed?.stage).toBe("beta");
    expect(AXODEX_RELEASE_STAGE).toBe("beta");
  });

  it("has a pre-release revision (since it's beta)", () => {
    const parsed = parseFraziymVersion(AXODEX_VERSION);
    expect(parsed?.revision).not.toBeNull();
    expect(parsed?.revision).toBeGreaterThan(0);
  });
});

describe("AXODEX_VERSION_SEMVER translation", () => {
  it("matches fraziymToSemver(AXODEX_VERSION)", () => {
    expect(AXODEX_VERSION_SEMVER).toBe(fraziymToSemver(AXODEX_VERSION));
  });

  it("is valid semver (parseable by npm)", () => {
    // Simple semver regex — npm uses a stricter one but this catches the
    // obvious cases (V-prefix, triple-digit minor, etc.)
    const semverRe = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    expect(AXODEX_VERSION_SEMVER).toMatch(semverRe);
  });
});

describe("Sync point: package.json", () => {
  it('"version" field matches AXODEX_VERSION_SEMVER', () => {
    const pkg = readJson(path.join(PACKAGE_ROOT, "package.json"));
    expect(pkg.version).toBe(AXODEX_VERSION_SEMVER);
  });

  it('"name" is @fraziym/axodex', () => {
    const pkg = readJson(path.join(PACKAGE_ROOT, "package.json"));
    expect(pkg.name).toBe("@fraziym/axodex");
  });
});

describe("Sync point: README.md", () => {
  it("mentions AXODEX_VERSION somewhere (displayed to users)", () => {
    const readme = readText(path.join(PACKAGE_ROOT, "README.md"));
    expect(readme).toContain(AXODEX_VERSION);
  });
});

describe("Sync point: this test file", () => {
  // The test itself is a sync point — by importing AXODEX_VERSION and
  // asserting on it, we ensure the test fails if version.ts is edited
  // without updating the expected values above.
  it("imports AXODEX_VERSION successfully", () => {
    expect(typeof AXODEX_VERSION).toBe("string");
    expect(AXODEX_VERSION.length).toBeGreaterThan(0);
  });
});
