import { Options } from "selenium-webdriver/chrome";
import {  Config } from "../../Shared";
import * as selenium from "selenium-webdriver";
import * as chromeDriver from "chromedriver"

/**
 * Defines the Chrome Sessions Options
 * https://chromedriver.chromium.org/capabilities
 *
 * start-maximized: Start Chrome maximized
 * --no-sandbox: Needed to run Chrome as root
 */
function getOptions(config: Config): Options {
  const options = new Options();
  options.addArguments("start-maximized");
  options.addArguments("--no-sandbox");

  return options;
}

export function getChromeDriver(sessionName: string, config: Config): selenium.ThenableWebDriver {
  return new selenium.Builder()
    .withCapabilities({
      browserName: config.browserName,
      version: config.browserVersion,
      enableVNC: true,
      enableVideo: false,
      screenResolution: "1920x1080",
      javascriptEnabled: true,
      acceptSslCerts: true,
      path: chromeDriver.path,
      name: sessionName
    })
    .setChromeOptions(getOptions(config))
    .usingServer(`${config.seleniumUrl}`)
    .build();
}



