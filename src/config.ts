export type EnvConfig = {
  alias?: string;
  files: string[];
  nodeEnv?: string;
};

export type Config = {
  [key: string]: EnvConfig;
};
