import { readFileSync } from "fs";
import { Graph } from "./src/core";

function main() {
  const manifest = readFileSync("./input/basic.mf", "utf-8");
  const graph = Graph.fromString(manifest);
  console.log(graph);
}

main();
