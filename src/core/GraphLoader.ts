import { type Node as AcornNode } from "acorn";
import { nodes } from "../config.json";
import Graph from "./Graph";
import Node, { NodeProps } from "./Node";
import { parseNode } from "./NodeParser";
import ParseError from "./ParseError";

interface NodeParseResult {
  name: string;
  node: Node<NodeProps>;
  startIndex: number;
  endIndex: number;
}

interface ObjectNode extends AcornNode {
  properties: ObjectNode[];
}

/**
 * Utility class for loading graphs from different sources
 */
export default class GraphLoader {
  /**
   * Generate a graph from a string
   *
   * @throws an error if an expected component was not found or
   * an error otherwise occured while parsing
   */
  public static parse(graphString: string): Graph {
    this.loadNodes();
    try {
      const tags = ["TITLE", "DESCRIPTION", "PIPELINE"];
      const lines = graphString.split("\n");

      // Get manifest metadata
      const title = this.getFirstWithTag(lines, "TITLE");
      const description = this.getFirstWithTag(lines, "DESCRIPTION");
      const pipeline = this.getFirstWithTag(lines, "PIPELINE")
        .split("->")
        .map((node) => node.trim());

      // Parse and instantiate the nodes
      const nodes = this.parseNodes(lines, tags);

      // Construct the graph
      const graph = new Graph(title, description);

      // Add nodes
      const nodeRegex = /\[[a-zA-Z0-9_]+\]/;
      for (const nodeName of pipeline) {
        if (nodeRegex.test(nodeName)) {
          continue;
        }
        const node = nodes[nodeName];
        if (node == null) {
          throw new ParseError(`Unregistered node in pipeline: ${nodeName}`);
        }
        graph.addNode(nodeName, node);
      }

      return graph;
    } catch (err) {
      throw new ParseError("Unable to parse graph!", err);
    }
  }

  /**
   * Load nodes registered in package.json
   */
  public static loadNodes() {
    for (const node of nodes) {
      require("../" + node);
    }
  }

  /**
   * Parse nodes in the specified manifest.
   * `otherTags` is a list of tags that indicate other lines to remove
   */
  private static parseNodes(
    lines: string[],
    otherTags: string[]
  ): Record<string, Node<NodeProps>> {
    // Filter out irrelevant lines
    let declarations = lines
      .filter((line) => {
        for (const other of otherTags) {
          if (line.startsWith(other) || line.length == 0) {
            return false;
          }
        }
        return true;
      })
      .join("\n")
      .trim();

    const nodes: Record<string, Node<NodeProps>> = {};
    // Parse nodes while any are present
    while (this.hasNode(declarations)) {
      const { startIndex, endIndex, node, name } = parseNode(declarations);
      declarations =
        declarations.substring(0, startIndex) +
        declarations.substring(endIndex + 1);
      nodes[name] = node;
    }
    return nodes;
  }

  /**
   * Returns true if there are still nodes available for parsing in the specified manifest
   */
  private static hasNode(manifest: string): boolean {
    // Empty string cannot contain node
    if (manifest.length == 0) {
      return false;
    }

    // Node declaration must contain an open/close parenthesis
    return !(manifest.indexOf("(") == -1 || manifest.indexOf(")") == -1);
  }

  /**
   * Get the first value labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  private static getFirstWithTag(lines: string[], tag: string): string {
    tag += ": ";
    const line = lines.find((line) => line.startsWith(tag));
    if (line == null) {
      throw new Error(`Line with tag "${tag}" was not found!`);
    }
    const value = line.substring(tag.length);
    return value;
  }

  /**
   * Get all values labeled with the specified `tag`
   * Tagged lines follow the format `{tag}: {value}`
   */
  private static getAllWithTag(lines: string[], tag: string): string[] {
    const matching = lines.filter((line) => line.startsWith(tag));
    const values = matching.map((line) =>
      line.substring(tag.length + 1).trim()
    );
    return values;
  }
}
