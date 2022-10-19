import Payload from "../../../core/Payload";
import { groupPayloads } from "../index";
import { getPayloadSum } from "./singular";
import getMatchingPayloads from "../../../util/getMatchingPayloads";

/**
 * Returns a mapping of unique values for the `target` property
 *  to the number of times they occur across the payloads
 */
export function getFrequencyHistogram(
  input: Payload[],
  target: string = "contentValue"
): Payload[] {
  const groups = groupPayloads(input, target);
  const frequencies = Object.entries(groups).map(([targetValue, payloads]) => ({
    contentType: `frequency ${targetValue}`,
    contentValue: payloads.length,
  }));
  return frequencies;
}

/**
 * Returns a mapping of unique values for the `groupKey` property
 * to the sum of the values of `target` across the payloads
 */
export function getGroupSum(
  input: Payload[],
  target: string = "contentValue",
  groupKey: string = "contentType"
): Payload[] {
  const matching = getMatchingPayloads(input, target);
  const groups = groupPayloads(matching, groupKey);
  const sums = Object.entries(groups).map(([groupKey, payloads]) => ({
    contentType: `group sum ${groupKey}`,
    contentValue: getPayloadSum(payloads, target),
  }));
  return sums;
}

/**
 * Returns a mapping of unique values for the `groupKey` property
 * to the average of the values of `target` across the payloads
 */
export function getGroupAverage(
  input: Payload[],
  target: string = "contentValue",
  groupKey: string = "contentType"
): Payload[] {
  const matching = getMatchingPayloads(input, target);
  const groups = groupPayloads(matching, groupKey);
  const averages = Object.entries(groups).map(([groupKey, payloads]) => ({
    contentType: `group average ${groupKey}`,
    contentValue: getPayloadSum(payloads, target) / payloads.length,
  }));
  return averages;
}