import { MapAggregateNode } from "../core";
import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";

export type AggregateOperation =
  | "count"
  | "sum"
  | "average"
  | "rank"
  | "histogramFrequency"
  | "groupAverage"
  | "groupSum";

export type AggregateProps = {
  operation: AggregateOperation;
  target?: string;
  groupKey?: string;
};

type AggregatePredicate = (
  resource: Resource,
  target?: string,
  groupKey?: string
) => Resource;

@MapAggregateNode("Aggregate", "Aggregate payloads using an operation")
export default class Aggregate extends Node<AggregateProps> {
  async process(resource: Resource): Promise<Resource> {
    let { operation, target, groupKey } = this.getLocalParams();

    const predicate = getPredicate(operation);
    return predicate(resource, target, groupKey);
  }

  getSchema(): Schema<Required<AggregateProps>> {
    return {
      target: {
        description: "The target field on each payload to aggregate from",
        defaultValue: "contentValue",
      },
      operation: {
        description: "The aggregation operation to perform",
        defaultValue: "count",
      },
      groupKey: {
        description:
          "Field with which to group payloads to perform aggregations on",
        defaultValue: "contentType",
      },
    };
  }
}

function getPredicate(operation: AggregateOperation): AggregatePredicate {
  switch (operation) {
    case "count":
      return (resource, target) => ({
        resourceType: resource.resourceType,
        metadata: {
          count: resource.data.reduce(
            (acc, curr) => (target in curr ? acc + 1 : acc),
            0
          ),
        },
        data: [],
      });

    case "sum":
      return (resource, target) => ({
        resourceType: resource.resourceType,
        metadata: {
          sum: resource.data.reduce(
            (acc, curr) => (target in curr ? acc + curr[target] : acc),
            0
          ),
        },
        data: [],
      });

    case "average":
      return (resource, target) => {
        const count = resource.data.reduce(
          (acc, curr) => (target in curr ? acc + 1 : acc),
          0
        );
        const sum = resource.data.reduce(
          (acc, curr) => (target in curr ? acc + curr[target] : acc),
          0
        );
        return {
          resourceType: resource.resourceType,
          metadata: {
            ...resource.metadata,
            average: count / sum,
          },
          data: [],
        };
      };
  }
}
