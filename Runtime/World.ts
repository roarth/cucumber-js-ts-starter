import {setDefaultTimeout, setWorldConstructor, World} from "cucumber";
import {Stream} from "stream";

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

}

setWorldConstructor(WorldObject);
setDefaultTimeout(120 * 1000);
