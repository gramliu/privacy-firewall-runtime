import { MapAggregateNode, Resource, Schema, Node } from "core";

export type SpoofProps = {
  key: string;
  value: unknown;
};

@MapAggregateNode("Spoof", "Spoof resource data according to their contents")
export default class Spoof extends Node<SpoofProps> {
  async process(resource: Resource): Promise<Resource> {
    const { key, value } = this.getLocalParams();
    return {
      ...resource,
      data: {
        ...resource.data,
        [key]: value,
      },
    };
  }

  getSchema(): Schema<Required<SpoofProps>> {
    return {
      key: {
        description: "The key on the resource data object to spoof",
      },
      value: {
        description: "The value to replace the data with",
      },
    };
  }
}
