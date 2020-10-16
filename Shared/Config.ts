import * as fs from "fs";

/**
 * Single instance of the config object.
 */
let config: Config = null;

/**
 * Access the config instance
 */
export function getConfig(): Config {
  return config;
}

/**
 * This is the global e2e run configuration
 */
export interface Config {
  browserName: "firefox" | "chrome",
  browserVersion: string;
  seleniumUrl: string;
};

/**
 * Load a default config setup
 */
function getDefaultConfig(): Config {
  return {
    browserName: "chrome",
    browserVersion: "81.0",
    seleniumUrl: 'http://localhost:4444/wd/hub'
  };
}

/**
 * Get the config from the config file,
 * this override the default config
 */
function getConfigFromFile(): Partial<Config> {
  const confPath = "./e2econfig.json";
  let parsed: Config = null;
  try {
    const content = fs.readFileSync(confPath).toString();
    parsed = JSON.parse(content);
  } catch (err) {
    return {};
  }

  return parsed;
}

/**
 * Get the config from env variables,
 * this override the previous config
 */
function getConfigFromEnvironment(): Config {
  return {
    browserName: process.env["BROWSER_NAME"] as any,
    browserVersion: process.env["BROWSER_VERSION"] as any,
    seleniumUrl: process.env["SELENIUM_URL"] as any
  };
}

/**
 * Load the configuration in this order:
 * - Default config
 * - Overrided by file config
 * - Overrided by environment variables
 */
export async function loadConfig(): Promise<Config> {
  const conf = getDefaultConfig() as any;
  const envConf = getConfigFromEnvironment() as any;
  const fileConf = getConfigFromFile() as any;

  // Override conf with files values
  for (let t in fileConf) {
    if (fileConf[t] !== undefined) {
      conf[t] = fileConf[t];
    }
  }
  // Override conf with environment values
  for (let t in envConf) {
    if (envConf[t] !== undefined) {
      conf[t] = envConf[t];
    }
  }

  config = conf;

  return conf;
}
