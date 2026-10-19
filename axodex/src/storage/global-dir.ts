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
 * Get the path to the global Axodex directory.
 * Precedence: $AXODEX_HOME → $FRAZIYM_HOME/axodex → ~/.fraziym/axodex.
 */
export const getGlobalDir = (): string => {
  return process.env.AXODEX_HOME || path.join(getFraziymDir(), 'axodex');
};
