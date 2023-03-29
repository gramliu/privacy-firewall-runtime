import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type InputProps = {
  fields: string[];
};

@MapAggregateNode("Select", "Select fields to retrieve")
export default class Select extends Node<InputProps> {
  async process(resource: Resource): Promise<Resource> {
    const { fields } = this.getLocalParams();
    const { data } = resource;

    for (const payload of data) {
      // TODO: Need to handle nested fields
      for (const key in payload) {
        if (!fields.includes(key)) {
          delete payload[key];
        }
      }
    }
    return resource;
  }

  getSchema(): Schema<Required<InputProps>> {
    return {
      fields: {
        description: "Fields to retrieve",
      },
    };
  }
}
