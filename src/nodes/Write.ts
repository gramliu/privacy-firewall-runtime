import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type WriteAction = "create" | "update" | "delete";

export type WriteProps = {
  resourceType: "file";
  action: WriteAction;
};

@MapAggregateNode("Write", "Write to some data source")
export default class Write extends Node<WriteProps> {
  async process(resource: Resource): Promise<Resource> {
    const { action } = this.getLocalParams();
    resource.metadata.writeAction = action;
    return resource;
  }

  getSchema(): Schema<Required<WriteProps>> {
    return {
      resourceType: {
        description: "The type of resource to write to.",
      },
      action: {
        description: "The action to perform on the resource.",
      },
    };
  }
}
