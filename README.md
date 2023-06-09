# Privacy Firewall Runtime

A linear manifest runtime for defining transformations on OAuth data. Built off of the [map-aggregate-runtime](https://github.com/gramliu/map-aggregate-runtime)

## Example Manifest

```
TITLE: Zoom
DESCRIPTION: Get all upcoming Zoom meetings
PIPELINE: CalendarEvents -> FilterZoom -> Select

CalendarEvents(
  type: "Input",
  resourceType: "calendar_event"
)
FilterZoom(
  type: "Filter",
  operation: "match",
  fields: ["location"],
  targetValue: /\bhttps?:\/\/(?:www\.)?(?:zoom\.(?:us|com|gov)|\w+\.zoom\.(?:us|com|gov))\/[^\s]+\b/
)
Select(
  type: "Select",
  operation: "select",
  fields: ["name", "location", "startTime"]
)
```

## Available Nodes

The list of available nodes are as follows:

- `Input`
- `Filter`
- `Limit`
- `Aggregate`
- `Sort`
- `Spoof`
- `Select`

## Parameters

Nodes are declared as follows:

```
MatchStreet(
  type: "Filter",
  operation: "===",
  target: "streetName",
  targetValue: "Forbes Avenue"
)
```

`type` is a required parameter for every node declaration. This declares the type of the node.

The remaining parameters are specific to each node.
