import GraphLoader from "../core/GraphLoader";
import * as fs from "fs";
import { Resource } from "../core";

test("Graph execution works normally", async () => {
  const manifest = fs.readFileSync("input/basic.mf").toString();
  const graph = GraphLoader.parse(manifest);
  const dummyData: Resource = {
    contentType: "calendar_event",
    data: [],
  };
  const dummyData: ResourceData[] = [];
  for (let i = 0; i < 10; i++) {
    dummyData.push({
      contentType: "calendar_event",
      data: [],
    });
  }
  await graph.execute(dummyData);
});
