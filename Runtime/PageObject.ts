/**
 *  Privowny
 *
 *  Copyright (c) Privowny 2010-2020 -- All Rights Reserved
 */
import { By } from "selenium-webdriver";
import { expect } from "chai";
import {getWorld} from ".";

/**
 * Globale registry of every page object classes.
 * Each class that derive from PageObject will automativally register in this service
 */
class PageObjectService {

  private map: Map<string, PageObject> = new Map();

  /**
   * Register a page object in the list of existing pageobject
   * @param po
   */
  register(po: PageObject) {
    this.map.set(po.name, po);
  }

  /**
   * Retrieve a page object instance or throw an error
   * if the provided page object name is invalid
   * @param name
   */
  getPageObject(name: string) {
    if (!this.map.has(name)) {
      throw new Error("Invalid page object name ");
    }
    return this.map.get(name);
  }

  /**
   * Return a By object referencing a given element in a given page object
   * @param pageObjectName
   * @param elementName
   */
  getElementByName(pageObjectName: string, elementName: string): By {
    const po = this.map.get(pageObjectName);
    if (!po) {
      throw new Error(`Invalid page object name: ${pageObjectName}`);
    }

    return po.getElementByName(elementName);
  }

}

/**
 * Unique instance of the page object service
 */
export let pageObjectService: PageObjectService = new PageObjectService();

/**
 * Define a single element in a page object ( like a button, a link ...)
 */
export interface PageObjectElement {
  name?: string; // The human readable name of this element within the page object
  by: By; // The selenium by accessor
  initiallyLoaded?: boolean; // Is the element loaded directly ? Used to check if page is displayed correctly with initially loaded elements only
}

export type PageObjectElements = { [element: string]: PageObjectElement };

/**
 * Base class for every page object element.
 */
export class PageObject {

  public name: string;

  constructor(name: string) {
    this.name = name;
    pageObjectService.register(this);
  }

  isDisplayedCorrectly() {
    throw new Error("Not yet implemented");
  }

  /**
   * Return the map of page object elements associated with this page object
   */
  private getElements(): PageObjectElements {
    //@ts-ignore
    const elements: PageObjectElements = this.elements;
    if (!elements)
      throw new Error(`The elements property is not defined on page object: ${this.name}`);
    return elements;
  }

  /**
   * Iterate over the list of elements of this page object and assert that they are
   * all present.
   */
  async areAllElementsVisibles(): Promise<void> {
    const world = getWorld();
    for (let element of Object.values(this.getElements())) {
      if (element.initiallyLoaded) {
        const e = await world.getElements(element.by);
        expect(e, `${this.name} - The ${element.name} element is not displayed correctly!`).to.not.be.empty;
      }
    }
  }

  getElementByName(name: string): By {
    const e = Object.values(this.getElements()).find(e => e.name === name);
    if (!e) {
      throw new Error(`Invalid page object element name: ${name}`);
    }

    return e.by;
  }

}

