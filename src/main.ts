import { spawn } from "node:child_process";
import { loadEnv } from "./load-env";
import { Command } from "commander";

type Args = {
  env: string;
  restArgs: string[];
};

const parseArgs = async (): Promise<Args> => {
  const command = new Command();
  command.argument("<env>", "Environment to load");
  const parsed = await command.parseAsync(process.argv);
  return {
    env: parsed.args[0] ?? "development",
    restArgs: parsed.args.slice(1),
  };
};

const runCommand = async (nodeEnv: string, cmd: string): Promise<void> => {
  const childProcess = spawn(cmd, {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: nodeEnv },
  });
  return new Promise<void>((resolve, reject) =>
    childProcess.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }
      if (code === 0) {
        resolve();
      } else {
        reject(`Process exited with code ${code}`);
      }
    })
  );
};

const main = async (): Promise<void> => {
  const { env, restArgs } = await parseArgs();
  const nodeEnv = await loadEnv(env);
  const cmd = restArgs.join(" ");
  await runCommand(nodeEnv, cmd);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
