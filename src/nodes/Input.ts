import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type InputProps = {
  resourceType: "calendar_event" | "photo";
};

@MapAggregateNode("Input", "Specify the type of resource to pull")
export default class Input extends Node<InputProps> {
  async process(resource: Resource): Promise<Resource> {
    return resource;
  }

  getSchema(): Schema<Required<InputProps>> {
    return {
      resourceType: {
        description: "The type of resource to pull.",
      },
    };
  }
}
