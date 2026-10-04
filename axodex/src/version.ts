/**
 * Axodex version — single authoritative source.
 *
 * Uses the FRAZIYM versioning format (NOT conventional semver):
 *
 *   VPP.FF.BBB-STAGE-RR
 *   │  │  │    │     │
 *   │  │  │    │     └── Pre-release revision (01, 02, …)
 *   │  │  │    └──────── Release stage (-alpha | -beta | -rc; omitted when stable)
 *   │  │  └───────────── Bug-fix version (000, 001, …)
 *   │  └──────────────── Feature version (00, 01, …)
 *   └─────────────────── Platform generation (V00, V01, …)
 *
 * Sync points that carry this string (verified by test/version.test.ts):
 *   - axodex/src/version.ts        (this file — the source of truth)
 *   - axodex/package.json          (the "version" field, semver-translated)
 *   - README.md                    (badge + display)
 *   - test/version.test.ts         (the test that verifies all sync points)
 *
 * The package.json version is a semver-compatible translation of this
 * string because npm requires valid semver. The mapping is:
 *   V00.01.000-beta-01  →  0.1.0-beta.1
 *   V00 → major 0
 *   01  → minor 1
 *   000 → patch 0
 *   -beta → -beta
 *   01  → .1
 *
 * Bump procedure:
 *   1. Edit this file — bump AXODEX_VERSION
 *   2. Translate to semver and update axodex/package.json "version"
 *   3. Update README.md displayed version
 *   4. Run `npm test` — version.test.ts will fail if any sync point is stale
 *   5. Commit + push + `npm publish`
 */

export const AXODEX_VERSION = "V00.01.000-beta-01";

/**
 * The release stage of the current version. Useful for runtime branching
 * (e.g. show a "beta" warning banner in the UI).
 */
export const AXODEX_RELEASE_STAGE: "alpha" | "beta" | "rc" | "stable" = "beta";

/**
 * Semver-compatible translation of AXODEX_VERSION. This is what
 * package.json "version" should match. The version.test.ts verifies
 * they stay in sync.
 */
export const AXODEX_VERSION_SEMVER = "0.1.0-beta.1";

/**
 * Parse a FRAZIYM version string into its components. Returns null if
 * the format doesn't match. Used by the test to verify the format is
 * well-formed.
 */
export function parseFraziymVersion(v: string): {
  platform: number;
  feature: number;
  bugfix: number;
  stage: "alpha" | "beta" | "rc" | "stable";
  revision: number | null;
} | null {
  const m = v.match(/^V(\d{2})\.(\d{2})\.(\d{3})(?:-(alpha|beta|rc)(?:-(\d{2}))?)?$/);
  if (!m) return null;
  return {
    platform: Number(m[1]),
    feature: Number(m[2]),
    bugfix: Number(m[3]),
    stage: (m[4] as "alpha" | "beta" | "rc" | undefined) ?? "stable",
    revision: m[5] ? Number(m[5]) : null,
  };
}

/**
 * Translate a FRAZIYM version string to its semver equivalent. Returns
 * null if the input isn't a valid FRAZIYM version.
 */
export function fraziymToSemver(v: string): string | null {
  const p = parseFraziymVersion(v);
  if (!p) return null;
  let semver = `${p.platform}.${p.feature}.${p.bugfix}`;
  if (p.stage !== "stable") {
    semver += `-${p.stage}`;
    if (p.revision !== null) semver += `.${p.revision}`;
  }
  return semver;
}
