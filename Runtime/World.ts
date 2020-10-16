import {HookScenarioResult, setDefaultTimeout, setWorldConstructor, World} from "cucumber";
import {Stream} from "stream";
import {Locator, WebDriver, WebElement} from "selenium-webdriver";
import {Config, getConfig} from "../Shared";
import {getFirefoxDriver} from "./Drivers/FirefoxDriver";
import {getChromeDriver} from "./Drivers/ChromeDriver";


export type MediaType = 'text/plain' | 'image/png' | 'application/json';
export type AttachBuffer = (data: Buffer, mediaType: MediaType) => void;
export type AttachText = (data: string) => void;
export type AttachStringifiedJson = (data: string, mediaType: 'application/json') => void;
export type AttachBase64EncodedPng = (data: string, mediaType: 'image/png') => void;
export type AttachFn = (data: Buffer | string | Stream, mediaType: MediaType) => void;

/**
 * Single instance of the world object.
 * This instance is created by cucumber framework, so you don't need to it
 */
let world: WorldObject = null;

/**
 * Access the world instance
 */
export function getWorld(): WorldObject {
  return world;
}

/**
 * This define the World constructore itself, in case we want to instanciate
 * stuff inside the world object
 */
class WorldObject implements World {

  private driver: WebDriver;
  public attach: AttachFn;
  private readonly config: Config;

  constructor({ attach }: World) {
    this.config = getConfig();
    this.attach = attach;
    world = this;
  }

  async initDriver(scenario: HookScenarioResult): Promise<WebDriver> {
    if (this.driver) {
      return;
    }
    if (this.config.browserName === "firefox") {
      this.driver = await getFirefoxDriver(scenario.pickle.name, this.config);
    } else if (this.config.browserName === "chrome") {
      this.driver = await getChromeDriver(scenario.pickle.name, this.config);
    } else {
      throw new Error("Unsupported browser");
    }

    return this.driver;
  }

  async destroyDriver(): Promise<any> {
    if (!this.driver) {
      return;
    }

    await this.driver.quit();
  }

  async takeScreenshot() {
    const screnshot = await this.driver.takeScreenshot();
    await this.attach(Buffer.from(screnshot, "base64"), "image/png");
  }

  async getElements(locator: Locator, element?: WebElement): Promise<WebElement[]> {
    if (!element) {
      return this.driver.findElements(locator);
    } else {
      return element.findElements(locator);
    }
  }
}

setWorldConstructor(WorldObject);
setDefaultTimeout(120 * 1000);
