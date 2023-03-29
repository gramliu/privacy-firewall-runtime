import { Parser, type Node as AcornNode } from "acorn";
import { getRegisteredNode } from "./MapAggregateNode";
import Node, { NodeProps } from "./Node";
import ParseError from "./ParseError";
import { ScalarType } from "./Resource";

interface NodeParseResult {
  name: string;
  node: Node<NodeProps>;
  startIndex: number;
  endIndex: number;
}

interface ObjectNode extends AcornNode {
  properties: PropertyNode[];
}

interface PropertyNode extends AcornNode {
  key: KeyNode;
  value: ValueNode | RegexValueNode | ArrayNode;
}

interface KeyNode extends AcornNode {
  name: string;
}

interface ValueNode extends AcornNode {
  type: "Literal";
  value: ScalarType;
  regex: never;
}

interface RegexValueNode extends AcornNode {
  type: "Literal";
  value: RegExp;
  regex: {
    pattern: string;
    flags: string;
  };
}

interface ArrayNode extends AcornNode {
  type: "ArrayExpression";
  elements: ValueNode[];
}

/**
 * Parse a node from the manifest.
 * At this point, there should be nothing else in the manifest
 * aside from node declarations
 */
export function parseNode(manifest: string): NodeParseResult {
  // Identify declaration substring
  const openIdx = manifest.indexOf("(");
  const closeIdx = manifest.indexOf("\n)") + 1;
  const declaration = manifest.substring(0, closeIdx + 1);
  try {
    // Extract relevant fields
    const name = declaration.substring(0, openIdx).trim();
    const paramsLine = declaration.substring(openIdx + 1, closeIdx);
    const params = parseParams(`{${paramsLine}}`);
    const nodeType = params["type"].toString();

    const registered = getRegisteredNode(nodeType);
    // Check if node is defined
    if (registered == null) {
      throw new ParseError(`Unregistered node type: ${nodeType}`);
    }

    // Instantiate node
    const node = new registered.constructor(params);
    return {
      name,
      node,
      startIndex: 0,
      endIndex: closeIdx,
    };
  } catch (err) {
    throw new ParseError("Could not parse node: " + declaration, err);
  }
}

/**
 * Parse the parameters to a node
 */
function parseParams(paramsStr: string): Record<string, ScalarType> {
  const parsedParams = Parser.parseExpressionAt(paramsStr, 0, {
    ecmaVersion: 6,
  }) as ObjectNode;
  const { properties } = parsedParams;

  const params: Record<string, any> = {};
  for (const property of properties) {
    const { key, value } = property;
    if (value.type === "Literal") {
      // Scalar or RegExp
      params[key.name] = value.value;
    } else {
      // Array
      params[key.name] = value.elements.map((element) => element.value);
    }
  }

  if (params["type"] == null) {
    throw new ParseError(
      "Missing required 'type' in params: " + JSON.stringify(params)
    );
  }
  return params;
}
