import { ResourceData } from "core/Payload";

/**
 * Returns a subsequence of `input` containing the `target` property
 */
export default function getMatchingResourceData(
  input: ResourceData[],
  target: string = "contentValue"
) {
  return input.filter((payload) => payload.hasOwnProperty(target));
}
