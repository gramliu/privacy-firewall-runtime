import { readFileSync } from "fs";
import { Graph } from "./src/core";
import { Parser, type Node } from "acorn";
import { ScalarType } from "core/Resource";

function main() {
  const manifest = readFileSync("./input/basic.mf", "utf-8");
  const graph = Graph.fromString(manifest);
  console.log(graph);
}

main();
