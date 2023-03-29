import GraphLoader from "./GraphLoader";
import type Node from "./Node";
import type { NodeProps } from "./Node";
import Resource, { ScalarType } from "./Resource";

export interface BenchmarkResult {
  result: Resource;
  performance: NodePerformance[];
}

export interface NodePerformance {
  node: string;
  duration: number;
  payloadsProcessed: number;
}

/**
 * A graph represents a linked list of executable nodes
 * Each node operates on an array of Payloads as its input and outputs it to the next node
 * Additional runtime parameters can be configured and passed into the graph at runtime
 *  as opposed to construction-time
 */
export default class Graph {
  private readonly pipeline: string[];
  private readonly nodeRegistry: Record<string, Node<NodeProps>>;

  constructor(
    public readonly title: string,
    public readonly description: string
  ) {
    this.pipeline = [];
    this.nodeRegistry = {};
  }

  /**
   * Execute this graph.
   *
   * @param resource an array of `Payload` to inject into the first node in the graph
   * @param overrides a mapping of nodes to runtime parameters to override
   * Each key in `input` should correspond to a node on this graph.
   * Each corresponding value should be a mapping of properties on that node
   * to the overriding values
   */
  public async execute(resource: Resource): Promise<Resource> {
    const { result } = await this.benchmark(resource);
    return result;
  }

  /**
   * Execute the graph but also measure time elapsed for each node
   */
  public async benchmark(resource: Resource): Promise<BenchmarkResult> {
    const performance = [] as NodePerformance[];
    let current = resource;
    for (const nodeName of this.pipeline) {
      const node = this.nodeRegistry[nodeName];
      const payloadsProcessed = current.data.length;
      const start = Date.now();

      current = await node.process(current);

      const end = Date.now();
      performance.push({
        node: nodeName,
        duration: end - start,
        payloadsProcessed,
      });
    }

    return {
      result: current,
      performance,
    };
  }

  /**
   * Add a node to the graph
   * @param name a unique name for the node
   * @param node the type of node to add
   *
   * @throws Error if node is null or a node with the same name already exists on the graph
   */
  public addNode<P extends NodeProps>(name: string, node: Node<P>) {
    if (node == null) {
      throw new Error("Cannot add a null node to the graph!");
    }
    if (this.hasNode(name)) {
      throw new Error(`A node named ${node} is already on this graph`);
    }
    this.nodeRegistry[name] = node;
    this.pipeline.push(name);
  }

  /**
   * Returns true if the specified node exists on this graph
   */
  public hasNode(name: string): boolean {
    return this.nodeRegistry[name] != null;
  }

  /**
   * Returns a copy of the nodes associated with this graph
   */
  public getNodes(): Record<string, Node<NodeProps>> {
    return { ...this.nodeRegistry };
  }

  /**
   * Load a graph from a string
   *
   * @throws an error if an expected component was not found or
   * an error otherwise occured while parsing
   */
  public static fromString(graphString: string): Graph {
    return GraphLoader.parse(graphString);
  }

  /**
   * Return a string representation of this graph
   */
  public toString(): String {
    const pipelineStr = this.pipeline.join(" -> ");
    return `Graph{title: "${this.title}", description: "${this.description}", pipeline: "${pipelineStr}", nodes: "${this.nodeRegistry}"}`;
  }
}
