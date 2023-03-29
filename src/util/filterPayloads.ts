import { ResourceData } from "../core/Resource";

/**
 * Returns the subsequence of `input` that contain the specified property
 */
export function filterWithProperty(input: ResourceData[], property: string) {
  return input.filter((payload) => payload.hasOwnProperty(property));
}

/**
 * Returns the subsequence of `input` that contain any of the specified properties
 */
export function filterWithAnyProperty(
  input: ResourceData[],
  properties: string[]
) {
  return input.filter((payload) =>
    properties.some((property) => payload.hasOwnProperty(property))
  );
}
