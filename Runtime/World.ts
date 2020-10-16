import {HookScenarioResult, setDefaultTimeout, setWorldConstructor, World} from "cucumber";
import {getChromeDockerDriver} from "./Drivers/ChromeDockerDriver";
import {Locator, until, WebDriver, WebElement} from "selenium-webdriver";
import {Config, getConfig} from "../Shared";
import {Stream} from "stream";
import {getFirefoxDriver} from "./Drivers/FirefoxDriver";
import {expect} from "chai"

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
      this.driver = await getChromeDockerDriver(scenario.pickle.name, this.config);
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

  async click(locator: Locator) {
    await this.driver.findElement(locator).click();
  }

  async sendKeys(locator: Locator, ...var_args: Array<string | number | Promise<string | number>>): Promise<void> {
    await this.driver.findElement(locator).sendKeys(...var_args);
  }

  async getElement(locator: Locator): Promise<WebElement> {
    return this.driver.findElement(locator);
  }

  async getElementType(locator: Locator): Promise<string> {
    const e = this.driver.findElement(locator);
    return e.getAttribute("type");
  }

  async getElementValue(locator: Locator): Promise<string> {
    const e = this.driver.findElement(locator);
    return e.getAttribute("value");
  }

  async getElementAttributeValue(locator: Locator, attribute: string): Promise<string> {
    const e = await this.driver.findElement(locator);
    return e.getAttribute(attribute);
  }

  async getElements(locator: Locator, element?: WebElement): Promise<WebElement[]> {
    if (!element) {
      return this.driver.findElements(locator);
    } else {
      return element.findElements(locator);
    }
  }

  async getPageSource(): Promise<string> {
    return this.driver.getPageSource();
  }

  async waitForElement(locator: Locator): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), this.config.defaultTimeout);
  }

  async waitForElementEnabled(locator: Locator): Promise<WebElement> {
    const e = await this.getElement(locator);
    return this.driver.wait(until.elementIsEnabled(e), this.config.defaultTimeout);
  }

  async waitForElementVisible(locator: Locator): Promise<WebElement> {
    const e = await this.getElement(locator);
    return this.driver.wait(until.elementIsVisible(e), this.config.defaultTimeout);
  }

  async waitForElementNotVisible(locator: Locator): Promise<WebElement> {
    const e = await this.getElement(locator);
    return this.driver.wait(until.elementIsNotVisible(e), this.config.defaultTimeout);
  }

  async waitForElementStaleness(locator: Locator): Promise<boolean> {
    const e = await this.getElement(locator);
    return this.driver.wait(until.stalenessOf(e), this.config.defaultTimeout);
  }

  async waitForElementWithText(locator: Locator, text: string) {
    const e = await this.getElement(locator);
    return this.driver.wait(until.elementTextIs(e, text), this.config.defaultTimeout);
  }

  async waitForElementTextContains(locator: Locator, text: string) {
    const e = await this.getElement(locator);
    return this.driver.wait(until.elementTextContains(e, text), this.config.defaultTimeout);
  }

  async waitForElementTextMatches(locator: Locator, regex: RegExp) {
    const e = await this.getElement(locator);
    return this.driver.wait(until.elementTextMatches(e, regex), this.config.defaultTimeout);
  }

  async getElementText(locator: Locator): Promise<string> {
    return this.driver.findElement(locator).getText();
  }

  async elementHasClass(locator: Locator, className: string) {
    const e = await this.getElement(locator);
    const c = await e.getAttribute("class");
    await expect(c).to.include(className);
  }

  /**
   *
   * @param duration
   * @param message
   */
  async sleep(duration: number, message?: string): Promise<void> {
    if(message) console.log('message: ', message);
    return this.driver.sleep(duration);
  }

  async executeScript(script: string, targetElement?: WebElement): Promise<WebElement|void>{
    return this.driver.executeScript(script, targetElement);
  }

  async getShadowRootElementChildren(parentElementLocator: Locator): Promise<WebElement> {
    const e = await this.getElement(parentElementLocator);
    return await this.driver.executeScript("return arguments[0].shadowRoot", e);
  }

  async takeScreenshot() {
    const screnshot = await this.driver.takeScreenshot();
    await this.attach(Buffer.from(screnshot, "base64"), "image/png");
  }

  async openUrl(url: string): Promise<void> {
    await this.driver.get(url);
  }

  async getPageTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  async getPageUrl(): Promise<string> {
    return this.driver.getCurrentUrl();
  }

  /**
   * Returns an array containing all the available windows in the browser's session
   */
  async getAllWindowHandles(): Promise<string[]> {
    return this.driver.getAllWindowHandles();
  }

  async getWindowHandle(): Promise<any> {
    return this.driver.getWindowHandle();
  }

  async getWindowTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  /**
   * Return a window descriptor by name
   * @param name
   */
  getWindowDescriptorByName(name: string) {
    const w = Object.values(productWindows).find(win => win.name === name);
    if (!w) {
      throw new Error(`Invalid window name: ${name}`);
    }

    return w;
  }

  /**
   * Test if a given window is open.
   * Please note that this doesn't change the currently activated window.
   *
   * @param name
   */
  async testIfWindowIsOpen(name: ProductWindow) {
    const currentWindow = await this.getWindowHandle();
    try {
      await this.switchToWindow(name);
    } catch (err) {
      throw new Error(`Window ${name} should be open, but is not`);
    }
    await this.driver.switchTo().window(currentWindow);
  }

  async testIfWindowHasFocus(name: ProductWindow) {
    const desc = this.getWindowDescriptorByName(name);
    const title = await world.getWindowTitle();
    expect(desc.regex.test(title)).to.be.true;
  }

  /**
   * Switch to a given window.
   * If the window does not exist, this function will retry several times
   * until the defaultTimeout value expire
   * @param name
   */
  async switchToWindow(name: ProductWindow) {
    const world = getWorld();
    const config = getConfig();

    let retryCount = 1;
    let waitDuration = 0;
    let timeout = config.defaultTimeout;

    if (timeout) {
      waitDuration = 1000;
      retryCount = timeout / waitDuration;
    }

    const win = this.getWindowDescriptorByName(name);

    for (let retry = 0; retry < retryCount; retry++) {

      // Grab all window handles and search for the one that match the regex
      // of the desired window
      const handles = await world.getAllWindowHandles();

      for (let i = 0; i < handles.length; i++) {
        // This try/catch is here to catch situation where switchTo()
        // would fail because the handle has been invalidated in between the moment we got them
        // and now.
        // Exemple:
        // - A close window command was scheduled by the selenium driver just before calling getAllWindowHandles()
        // - the getAllWindowHandles return that handle
        // - The command is executed and the window is close, but the handle is still here
        // - switchTo() is called and fail ...
        try {
          await this.driver.switchTo().window(handles[i]);
          const name = await world.getWindowTitle();
          // Return if a match is found
          if (win.regex.test(name)) {
            return;
          }
        } catch (err) {

        }
      }

      // If nothing found, wait a bit before retrying
      if (waitDuration)
        await world.sleep(waitDuration);
    }

    // Throw an error if nothing is found after all the retry
    throw new Error(`Failled to switch to window named: ${name}`);
  }
}

setWorldConstructor(WorldObject);
setDefaultTimeout(120 * 1000);
