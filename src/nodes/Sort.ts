import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";

export type SortProps = {
  sortKey: string;
  order: "ascending" | "descending";
};

@MapAggregateNode("Sort", "Sort resource data according to their contents")
export default class Sort extends Node<SortProps> {
  async process(resource: Resource): Promise<Resource> {
    const { order, sortKey } = this.getLocalParams();
    resource.data.sort((a, b) => {
      if (b[sortKey] > a[sortKey]) return order === "ascending" ? -1 : 1;
      if (b[sortKey] < a[sortKey]) return order === "ascending" ? 1 : -1;
      return 0;
    });
    return resource;
  }

  getSchema(): Schema<Required<SortProps>> {
    return {
      sortKey: {
        description: "The key on the resource data object to sort by",
      },
      order: {
        description: "The direction by which to sort the data",
      },
    };
  }
}
