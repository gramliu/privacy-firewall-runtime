import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type ChooseProps = {
  count: number;
};

@MapAggregateNode("Limit", "Limit the number of child data payloads.")
export default class Choose extends Node<ChooseProps> {
  async process(resource: Resource): Promise<Resource> {
    const { count } = this.getLocalParams();
    if (resource.data.length < count) {
      return { ...resource };
    } else {
      return { ...resource, data: resource.data.slice(0, count) };
    }
  }

  getSchema(): Schema<Required<ChooseProps>> {
    return {
      count: {
        description:
          "The number of child data payloads to keep. If there are fewer than this number, all payloads are kept.",
      },
    };
  }
}
