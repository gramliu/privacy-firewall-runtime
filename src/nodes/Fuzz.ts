import Resource from "../core/Resource";
import Schema from "../core/Schema";
import getMatchingResourceData from "../util/getMatchingPayloads";
import MapAggregateNode from "../core/MapAggregateNode";
import Node from "../core/Node";
import { ResourceData } from "core/Payload";

type RangeType = "linear" | "logarithmic" | "halfLogarithmic";

export type FuzzProps = {
  fuzzType: "likert" | "range" | "percent";
  target: string;
  likertMean?: number;
  likertStdDev?: number;
  rangeType?: RangeType;
};

@MapAggregateNode(
  "Fuzz",
  "Convert a fine-grained number into a format with coarser granularity"
)
export default class Fuzz extends Node<FuzzProps> {
  async process(resource: Resource): Promise<Resource> {
    const { fuzzType, target, rangeType } = this.getLocalParams(params);
    const matching = getMatchingResourceData(resource.data, target);
    switch (fuzzType) {
      case "range":
        let fuzzed = fuzzDataIntoRange(matching, target, rangeType);
        return { ...resource, data: fuzzed };

      case "percent":
        fuzzed = fuzzDataIntoPercent(matching, target);
        return { ...resource, data: fuzzed };
    }
  }

  getSchema(): Schema<Required<FuzzProps>> {
    return {
      fuzzType: {
        description: "The type of fuzz operation to perform",
      },
      target: {
        description: "The target property on payloads to fuzz",
        defaultValue: "contentValue",
      },
      likertMean: {
        description: "Mean to be used in likert scaling",
      },
      likertStdDev: {
        description: "Standard deviation to be used in likert scaling",
      },
      rangeType: {
        description:
          "The type of range to apply, e.g. linear, logarithmic, halfLogarithmic",
        defaultValue: "logarithmic",
      },
    };
  }
}

/**
 * Fuzz payload values into bins of size `rangeStart`
 */
function fuzzDataIntoRange(
  input: ResourceData[],
  target: string,
  rangeType: RangeType
): ResourceData[] {
  const output = [];
  for (const payload of input) {
    const value = payload[target];

    if (typeof value !== "number") {
      throw new Error("Can only perform range fuzz on numeric values!");
    }

    let binLo = 0;
    let binHi = 0;

    switch (rangeType) {
      case "logarithmic":
        [binLo, binHi] = computeLogarithmicBin(value);
        break;

      case "halfLogarithmic":
        [binLo, binHi] = computeLogarithmicBin(value, true);
    }

    output.push({
      ...payload,
      [`${target}`]: `${binLo}-${binHi}`,
    });
  }

  return output;
}

/**
 * Compute low and high logarithmic bins for a value
 */
function computeLogarithmicBin(
  value: number,
  splitHalf: boolean = false
): [number, number] {
  const abs = Math.abs(value);
  const sign = value == 0 ? 1 : Math.sign(value);

  const loPow = value == 0 ? 0 : Math.floor(Math.log10(abs));
  let lo = Math.pow(10, loPow) * sign;
  let hi = Math.pow(10, loPow + 1) * sign;

  if (lo > hi) {
    [lo, hi] = [hi, lo];
  }

  // Include midpoints i.e. [10, 100] -> [10, 50] or [50, 100]
  if (splitHalf) {
    const mid = lo * 5;
    if (value < mid) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return [lo, hi];
}

/**
 * Fuzz payload values into percentages of the maximum encountered value
 */
function fuzzDataIntoPercent(
  input: ResourceData[],
  target: string
): ResourceData[] {
  const output = [];
  const payloadMax = input.reduce((max, payload) =>
    payload.contentValue > max.contentValue ? payload : max
  ).contentValue as number;
  if (typeof payloadMax !== "number") {
    throw new Error("Can only perform percent fuzz on numeric values!");
  }
  for (const payload of input) {
    const value = payload[target];
    output.push({
      ...payload,
      [`${target}`]: (value * 100) / payloadMax,
    });
  }
  return output;
}
