import * as fs from "fs";
import GraphLoader from "../core/GraphLoader";
import Resource from "../core/Resource";

test("Graph execution works normally", async () => {
  const manifest = fs.readFileSync("input/basic.mf").toString();
  const rawData = fs.readFileSync("./input/basic.json", "utf-8");
  const json = JSON.parse(rawData);

  const resource = {
    resourceType: "calendar_event",
    metadata: { ...json, items: undefined },
    data: json.items,
  } as Resource;

  const graph = GraphLoader.parse(manifest);
  await graph.execute(resource);
});
