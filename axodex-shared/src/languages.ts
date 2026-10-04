/**
 * Supported language enum — single source of truth.
 *
 * Both CLI and web use this to identify which language a file/node belongs to.
 * The CLI uses it throughout the ingestion pipeline; the web uses it for display.
 *
 * v0.3.7: Added 12 new languages (Bash, SQL, Dockerfile, YAML, TOML, JSON,
 * HTML, CSS, Scala, Elixir, Lua, GraphQL) for a total of 30.
 */
export enum SupportedLanguages {
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Java = 'java',
  C = 'c',
  CPlusPlus = 'cpp',
  ObjectiveC = 'objective-c',
  CSharp = 'csharp',
  Go = 'go',
  Ruby = 'ruby',
  Rust = 'rust',
  PHP = 'php',
  Kotlin = 'kotlin',
  Swift = 'swift',
  Dart = 'dart',
  Vue = 'vue',
  /** Standalone regex processor — no tree-sitter, no LanguageProvider. */
  Cobol = 'cobol',
  Zig = 'zig',
  // ── v0.3.7 additions ──────────────────────────────────────────────────
  /** Bash/Shell scripts — critical for AXONIZ shell tools output parsing. */
  Bash = 'bash',
  /** SQL queries — database embedded in code. */
  SQL = 'sql',
  /** Dockerfile — container infra. */
  Dockerfile = 'dockerfile',
  /** YAML config files. */
  YAML = 'yaml',
  /** TOML config files (pyproject.toml, Cargo.toml). */
  TOML = 'toml',
  /** JSON data/config files. */
  JSON = 'json',
  /** HTML markup — web. */
  HTML = 'html',
  /** CSS stylesheets — web. */
  CSS = 'css',
  /** Scala — JVM functional language. */
  Scala = 'scala',
  /** Elixir — BEAM functional language. */
  Elixir = 'elixir',
  /** Lua — game/embedded scripting. */
  Lua = 'lua',
  /** GraphQL — API query language. */
  GraphQL = 'graphql',
}
