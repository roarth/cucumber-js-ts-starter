import { Options } from "selenium-webdriver/firefox";
import { Config } from "../../Shared";
import * as selenium from "selenium-webdriver";

/**
 * Defines the Firefox Sessions Options
 */
function getOptions(config: Config): Options {
  return new Options();
}

export function getFirefoxDriver(sessionName: string, config: Config): selenium.ThenableWebDriver {
  return new selenium.Builder()
    .withCapabilities({
      browserName: config.browserName,
      version: config.browserVersion,
      enableVNC: true,
      enableVideo: false,
      javascriptEnabled: true,
      acceptInsecureCerts: true,
      acceptSslCerts: true,
      name: sessionName
    })
    .setFirefoxOptions(getOptions(config))
    .usingServer(`${config.seleniumUrl}`)
    .build();
}



