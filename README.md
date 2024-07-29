# @bb-tools/withenv

This projects aims to simplify loading of environment variables with [dotenv](https://www.npmjs.com/package/dotenv) in a monorepo.

It consists of 2 parts:

- A `withenv` command which we use to call dotenv before running commands.
- A `loadEnv` function which you can reuse in any TS/JS code.

See the [_Configuration_](#configuration) section for details about the `.env.yaml` file or continue reading for usage instructions.

## Installation

```bash
npm install @bb-tools/withenv
```

## Usage

### withenv

Usage:

```txt
withenv <env> -- [command...]
```

Example:

```text
withenv test -- jest
```

### loadEnv

Usage:

```ts
import { loadEnv } from "withenv";

// Loads the environment into process.env
await loadEnv("test");
```

## Configuration

Most of the magic behind withenv is a `.env.yaml` file whose goal is to define execution environments in a declarative way.

Example:

```yaml
dev:
  nodeEnv: development
  files:
    - .env.dev
```

In this file, an environment named `dev` is declared.

As you might have guessed, when used with the `dev` environment, withenv will:

- Set the `NODE_ENV` environment variable value to `development`.

- Load non-sensitive environment variables from the `.env.dev` dotenv file located alongside the `.env.yaml` file.

- Load local overrides and secrets from the `.env.dev.local` dotenv file.

### Environment options

The properties described in the table below can be used for each environment defined in the `.env.yaml` file.

| Name      | Description                                                                     | Required | Default value                                                                                            |
| --------- | ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `nodeEnv` | The value of `NODE_ENV` to use                                                  | NO       | Environment name if it exists in the `NodeEnv` enum of [`@kwentapay/node-utils`](../node-utils) package. |
| `files`   | List of `.env` files to be loaded.                                              | YES      |                                                                                                          |
| `alias`   | An optional alias to name the environment (e.g. `development` instead of `dev`) | NO       |                                                                                                          |

### Local overrides

Local files can be defined for both the dotenv and withenv:

- `<environment_file>.local` (e.g. `.env.local`) to define local environment variables.

- `.env.local.yaml` to add new environments or override the existing ones.  
  i.e.: **This is where your personal secrets can be placed.**

These files must be ignored by Git ([documentation](https://git-scm.com/docs/gitignore)). For example, you can add the following lines to your `.gitignore` file:

```gitignore
*.local
*.local.yaml
```

### More information

See:

- The [`src/load-env.ts`](src/load-env.ts) file for details about the loading process.

- The [`src/config.ts`](src/config.ts) file to see the configuration TS types.
