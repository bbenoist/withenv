import { readFile } from "node:fs/promises";
import { dirname, join as joinPath } from "node:path";
import dotenv from "dotenv";
import yaml from "yaml";
import { SetRequired } from "type-fest";
import { EnvConfig, Config } from "./config";
import { CONFIG_FILE_PREFIX } from "./constants";
import { findUp } from "./find-up";

type LoadedEnvConfig = SetRequired<Omit<EnvConfig, "alias">, "nodeEnv">;

type LoadedConfig = Map<string, LoadedEnvConfig>;

type FindConfigOptions<TRequired extends boolean = false> = {
  required?: TRequired;
};

type FindConfigResult<TRequired extends boolean = false> =
  TRequired extends true ? string : string | undefined;

const findConfig = async <TRequired extends boolean = false>(
  name: string[],
  { required }: FindConfigOptions<TRequired> = {}
): Promise<FindConfigResult<TRequired>> => {
  const path = await findUp(name);
  if (!!path || !required) return path as FindConfigResult<TRequired>;
  throw new Error(`Could not find config file ${name[0]}`);
};

const parseConfig = async (fileName: string): Promise<LoadedConfig> => {
  const text = await readFile(fileName, "utf8");
  const parsed: Config = yaml.parse(text);

  const cwd = dirname(fileName);

  const resolvedMap: LoadedConfig = new Map();
  for (const [key, value] of Object.entries(parsed)) {
    const nodeEnv = value.nodeEnv ?? key;

    const files = value.files.map((file: string) => joinPath(cwd, file));

    const patched = { nodeEnv, files } satisfies LoadedEnvConfig;
    resolvedMap.set(key, patched);
    if (!value.alias) continue;
    resolvedMap.set(value.alias, patched);
  }

  return resolvedMap;
};

type LoadConfigFileOptions<TRequired extends boolean = false> =
  FindConfigOptions<TRequired>;

type LoadConfigFileResult<TRequired extends boolean = false> =
  TRequired extends true ? LoadedConfig : LoadedConfig | undefined;

const loadConfigFile = async <TRequired extends boolean = false>(
  name: string[],
  options: LoadConfigFileOptions<TRequired> = {}
): Promise<LoadConfigFileResult<TRequired>> => {
  const path = await findConfig<TRequired>(name, options);

  if (!path) {
    if (!options.required) return undefined as LoadConfigFileResult<TRequired>;
    throw new Error(`Could not find env file: ${name[0]}`);
  }

  return parseConfig(path);
};

const loadConfig = async (): Promise<LoadedConfig> => {
  const baseConfig = await loadConfigFile(
    [`${CONFIG_FILE_PREFIX}.yaml`, `${CONFIG_FILE_PREFIX}.yml`],
    { required: true }
  );
  const localConfig = await loadConfigFile([
    `${CONFIG_FILE_PREFIX}.local.yaml`,
    `${CONFIG_FILE_PREFIX}.local.yml`,
  ]);
  return new Map<string, LoadedEnvConfig>([
    ...baseConfig.entries(),
    ...(localConfig?.entries() ?? []),
  ]);
};

const getEnvConfig = (config: LoadedConfig, env: string): LoadedEnvConfig => {
  const envConfig = config.get(env);
  if (envConfig) return envConfig;
  throw new Error(`Could not find environment ${env} in configuration file.`);
};

const loadEnvFiles = (envFiles: string[]): void => {
  for (const envFile of envFiles) {
    dotenv.config({ path: envFile, override: true });
    dotenv.config({ path: `${envFile}.local`, override: true });
  }
};

export const loadEnv = async (env: string): Promise<string> => {
  const config = await loadConfig();
  const { files, nodeEnv } = getEnvConfig(config, env);
  loadEnvFiles(files);
  return nodeEnv;
};
