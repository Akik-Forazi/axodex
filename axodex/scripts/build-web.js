import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function shouldBuildWeb(argv = process.argv, env = process.env) {
  return argv.includes('--web') || env.AXODEX_BUILD_WEB === '1';
}

export function shouldPreserveWebOutput(env = process.env) {
  return (
    env.npm_lifecycle_event === 'prepare' &&
    (env.npm_command === 'pack' || env.npm_command === 'publish')
  );
}

/** Build and copy the web UI when `--web` / AXODEX_BUILD_WEB=1 is set. */
export function runWebBuild({
  root,
  dist,
  timeoutMs,
  argv = process.argv,
  env = process.env,
  fsImpl = fs,
  exec = execSync,
}) {
  const webRoot = path.resolve(root, '..', 'axodex-web');
  const webDest = path.join(dist, '..', 'web');

  if (!shouldBuildWeb(argv, env)) {
    if (shouldPreserveWebOutput(env)) {
      console.log('[build] preserving prepack web UI during npm prepare');
    } else {
      fsImpl.rmSync(webDest, { recursive: true, force: true });
      console.log(
        '[build] skipping web UI and removed stale output ' +
          '(pass --web or set AXODEX_BUILD_WEB=1 to include it)',
      );
    }
    return { status: 'skipped', webDest };
  }

  if (!fsImpl.existsSync(path.join(webRoot, 'package.json'))) {
    throw new Error(
      `[build] web UI requested, but axodex-web was not found at ${webRoot}. ` +
        'Run this command from the complete monorepo checkout.',
    );
  }

  console.log('[build] building axodex-web…');
  if (!fsImpl.existsSync(path.join(webRoot, 'node_modules'))) {
    // Deliberately untimed: this is a full second install, and killing it
    // partway through leaves a broken tree and a misleading ETIMEDOUT.
    // CI should install axodex-web itself (cached, its own step) so this
    // fallback only fires for a local `npm pack` / `npm publish`.
    console.log('[build] installing axodex-web dependencies (no local node_modules)…');

    // CRITICAL: npm 11+ blocks `npm ci` in sub-projects (project-scoped
    // installs) if the user's global ~/.npmrc has `allow-scripts=true` set
    // (which happens when the user runs `npm install-scripts approve`).
    // The error is:
    //   npm error code EALLOWSCRIPTS
    //   npm error --allow-scripts is not allowed in project-scoped installs.
    //
    // The fix: pass --userconfig pointing to an EMPTY temp .npmrc file.
    // This overrides ALL inherited .npmrc settings (global + project-level),
    // so npm 11 doesn't see `allow-scripts=true` from the user's config.
    // With a clean config, `npm ci` runs with default settings (no install
    // scripts), which is what we want — axodex-web has no native bindings.
    const tempNpmrc = path.join(webRoot, '.temp-publish.npmrc');
    fsImpl.writeFileSync(tempNpmrc, '');  // empty = no inherited allow-scripts
    console.log(`[build] using temp .npmrc to bypass EALLOWSCRIPTS`);
    try {
      exec(`npm ci --userconfig "${tempNpmrc}"`, { cwd: webRoot, stdio: 'inherit' });
    } finally {
      try { fsImpl.unlinkSync(tempNpmrc); } catch { /* best-effort cleanup */ }
    }
  }
  exec('npm run build', { cwd: webRoot, stdio: 'inherit', timeout: timeoutMs });

  const builtIndex = path.join(webRoot, 'dist', 'index.html');
  if (!fsImpl.existsSync(builtIndex)) {
    throw new Error(`[build] axodex-web build completed without ${builtIndex}`);
  }

  fsImpl.rmSync(webDest, { recursive: true, force: true });
  fsImpl.cpSync(path.join(webRoot, 'dist'), webDest, { recursive: true });
  console.log('[build] copied web UI → axodex/web/');
  return { status: 'built', webDest };
}
