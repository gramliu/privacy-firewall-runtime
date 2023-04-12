import { MapAggregateNode } from "../core";
import Node from "../core/Node";
import Resource, { ScalarType } from "../core/Resource";
import Schema from "../core/Schema";
import { filterWithAnyProperty } from "../util/filterPayloads";

export type FilterOperation =
  | "==="
  | "!=="
  | ">"
  | ">="
  | "<"
  | "<="
  | "includes"
  | "not includes"
  | "match";

// Mapping of predetermined filter patterns
const filterPatterns = {
  "Zoom URL":
    /\bhttps?:\/\/(?:www\.)?(?:zoom\.(?:us|com|gov)|\w+\.zoom\.(?:us|com|gov))\/[^\s]+\b/,
} as const;

export type FilterPattern = "Zoom URL";

export type FilterProps = {
  operation: FilterOperation;
  fields: string[];
  requirement: "any" | "all";
  targetValue: ScalarType;
  pattern: FilterPattern;
};

@MapAggregateNode("Filter", "Filter payloads based on a predicate")
export default class Filter extends Node<FilterProps> {
  async process(resource: Resource): Promise<Resource> {
    const {
      operation,
      requirement,
      fields: fieldNames,
      targetValue,
      pattern,
    } = this.getLocalParams();
    const withProperties = filterWithAnyProperty(resource.data, fieldNames);
    const predicate = getPredicate(operation);

    let predicateTarget = targetValue;
    if (pattern) {
      predicateTarget = filterPatterns[pattern];
      if (!predicateTarget) {
        throw new Error("Unknown pattern: " + pattern);
      }
    }

    // Filter ResourceData
    const filteredData = withProperties.filter((payload) => {
      const fields = fieldNames.map((fieldName) => payload[fieldName]);
      if (requirement === "all") {
        // Ensure all fields match
        return fields.every((field) => predicate(field, predicateTarget));
      } else {
        // Ensure at least one field matches
        return fields.some((field) => predicate(field, predicateTarget));
      }
    });

    return {
      ...resource,
      data: filteredData,
    };
  }

  getSchema(): Schema<Required<FilterProps>> {
    return {
      operation: {
        description:
          "The operation to use to compare against comparisonValue. Order: (payload value) [operation] (comparisonValue)",
        defaultValue: "===",
      },
      fields: {
        description: "The fields on the object to compare",
      },
      requirement: {
        description:
          "The strictness of the filter condition that must be met for a payload to be included",
        defaultValue: "any",
      },
      targetValue: {
        description: "The value or pattern to compare against",
      },
      pattern: {
        description: "A predefined pattern to match against",
      },
    };
  }
}

/**
 * Returns the predicate function corresponding to the specified operation
 */
function getPredicate(
  filterOperation: FilterOperation
): (values: ScalarType, comparison: ScalarType) => boolean {
  switch (filterOperation) {
    case "===":
      return (a, b) => a === b;

    case "!==":
      return (a, b) => a !== b;

    case ">":
      return (a, b) => a > b;

    case ">=":
      return (a, b) => a >= b;

    case "<":
      return (a, b) => a < b;

    case "<=":
      return (a, b) => a <= b;

    case "includes":
      return (a: string, b: string) => a.includes(b);

    case "not includes":
      return (a: string, b: string) => !a.includes(b);

    case "match":
      return (a: string, b: RegExp) => b.test(a);
  }
}
