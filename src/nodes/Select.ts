import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type SelectProps = {
  fields: string[];
};

@MapAggregateNode("Select", "Select fields to retrieve")
export default class Select extends Node<SelectProps> {
  async process(resource: Resource): Promise<Resource> {
    const { fields } = this.getLocalParams();
    const { data } = resource;
    const outputData = [];

    for (const payload of data) {
      const replica: Record<string, any> = {};
      const payloadFields = Object.keys(payload);
      for (const field of fields) {
        if (payloadFields.includes(field)) {
          replica[field] = payload[field];
        }
      }
      outputData.push(replica);
    }
    resource.data = outputData;
    return resource;
  }

  getSchema(): Schema<Required<SelectProps>> {
    return {
      fields: {
        description: "Fields to retrieve",
      },
    };
  }
}
