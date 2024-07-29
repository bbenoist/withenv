import {
  dirname,
  join as joinPath,
  parse as parsePath,
  resolve,
} from "node:path";
import fs from "node:fs/promises";

export const pathExists = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Options for the findUp function.
 * @see findUp
 */
export type FindUpOptions = {
  /**
   * The directory to start searching from (default: process.cwd()).
   */
  cwd?: string;

  /**
   * The root directory to stop searching at (default: root of file system).
   */
  rootDir?: string;

  /**
   * The name of a file or directory which, if found, will stop the search.
   */
  stopAt?: string;
};

/**
 * Searches for a file in the current directory and all parent directories.
 * @param fileName - The name of the file to search for.
 * @param cwd - The directory to start searching from (default: process.cwd()).
 * @returns The path to the file if found, otherwise undefined.
 */
export const findUp = async (
  fileName: string | string[],
  {
    cwd = process.cwd(),
    rootDir = parsePath(cwd).root,
    stopAt,
  }: FindUpOptions = {}
): Promise<string | undefined> => {
  let currentDir = resolve(cwd);

  do {
    for (const name of Array.isArray(fileName) ? fileName : [fileName]) {
      const filePath = joinPath(currentDir, name);
      if (await pathExists(filePath)) {
        return filePath;
      }
    }

    if (!!stopAt) {
      const stopPath = joinPath(currentDir, stopAt);
      if (await pathExists(stopPath)) {
        return undefined;
      }
    }

    currentDir = dirname(currentDir);
  } while (currentDir !== rootDir);

  return undefined;
};
