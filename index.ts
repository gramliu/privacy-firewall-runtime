import Resource from "core/Resource";
import { readFileSync } from "fs";
import { Graph } from "./src/core";

async function main() {
  const manifest = readFileSync("./input/basic.mf", "utf-8");
  const rawData = readFileSync("./input/basic.json", "utf-8");
  const json = JSON.parse(rawData);
  const resource = {
    resourceType: "calendar_event",
    metadata: { ...json, items: undefined },
    data: json.items,
  } as Resource;

  const graph = Graph.fromString(manifest);
  const { performance, result } = await graph.benchmark(resource);
  console.log(resource);
  console.log(result);
  console.log(performance);
}

main();
