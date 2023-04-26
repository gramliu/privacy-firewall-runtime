import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type WriteAction = "create" | "update" | "delete";

export type WriteProps = {
  resourceType: "file";
  actions: WriteAction[];
};

@MapAggregateNode("Write", "Write to some data source")
export default class Write extends Node<WriteProps> {
  async process(resource: Resource): Promise<Resource> {
    return resource;
  }

  getSchema(): Schema<Required<WriteProps>> {
    return {
      resourceType: {
        description: "The type of resource to write to.",
      },
    };
  }
}
