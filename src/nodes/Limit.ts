import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type LimitProps = {
  count: number;
};

@MapAggregateNode("Limit", "Limit the number of child data payloads.")
export default class Limit extends Node<LimitProps> {
  async process(resource: Resource): Promise<Resource> {
    const { count } = this.getLocalParams();
    if (resource.data.length < count) {
      return { ...resource };
    } else {
      return { ...resource, data: resource.data.slice(0, count) };
    }
  }

  getSchema(): Schema<Required<LimitProps>> {
    return {
      count: {
        description:
          "The number of child data payloads to keep. If there are fewer than this number, all payloads are kept.",
      },
    };
  }
}
