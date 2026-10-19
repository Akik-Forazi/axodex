import os from 'node:os';
import path from 'node:path';

/**
 * Shared Fraziym root — one dir for every Fraziym product
 * (~/.fraziym, override: $FRAZIYM_HOME).
 */
export const getFraziymDir = (): string => {
  const override = process.env.FRAZIYM_HOME?.trim();
  return override ? path.resolve(override) : path.join(os.homedir(), '.fraziym');
};

/**
 * Machine-local Fraziym root for caches and state that never roams
 * (T2 — `%LOCALAPPDATA%\FRAZIYM` on Windows, `~/Library/Caches/FRAZIYM`
 * on macOS, `$XDG_CACHE_HOME/fraziym` on Linux). Override: `$FRAZIYM_LOCAL`.
 */
export const getFraziymLocalDir = (): string => {
  const override = process.env.FRAZIYM_LOCAL?.trim();
  if (override) return path.resolve(override);
  if (process.platform === 'win32') {
    const base = process.env.LOCALAPPDATA?.trim() || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(base, 'FRAZIYM');
  }
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Caches', 'FRAZIYM');
  const xdg = process.env.XDG_CACHE_HOME?.trim();
  return path.join(xdg || path.join(os.homedir(), '.cache'), 'fraziym');
};

/**
 * Get the path to the global Axodex directory.
 * Precedence: $AXODEX_HOME → $FRAZIYM_HOME/axodex → ~/.fraziym/axodex.
 */
export const getGlobalDir = (): string => {
  return process.env.AXODEX_HOME || path.join(getFraziymDir(), 'axodex');
};
