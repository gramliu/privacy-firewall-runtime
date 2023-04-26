import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";
import z from "zod";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

export type FileType = "document" | "image" | "text";

export type RestrictProps = {
  folderId: string;
  fileTypes: FileType[];
};

// Mapping from file types to mime types
const mimeTypeMapping: Record<FileType, string[]> = {
  document: ["application/pdf"],
  image: ["image/png", "image/jpeg"],
  text: ["text/plain"],
};

const createMetadataSchema = z.object({
  writeAction: z.literal("create"),
  parent: z.string(),
  fileId: z.string(),
  name: z.string(),
  mimeType: z.string(),
});

const mutateMetadataSchema = z.object({
  writeAction: z.enum(["update", "delete"]),
  fileId: z.string(),
});

const metadataSchema = z.union([createMetadataSchema, mutateMetadataSchema]);

@MapAggregateNode("Restrict", "Restrict writes to a narrower scope")
export default class Restrict extends Node<RestrictProps> {
  async process(resource: Resource): Promise<Resource> {
    const { folderId, fileTypes } = this.getLocalParams();
    const authClient: OAuth2Client | undefined = resource.metadata?.authClient;
    const allowedMimeTypes = fileTypes.flatMap(
      (fileType) => mimeTypeMapping[fileType]
    );

    if (authClient == null) {
      // Require OAuth client to be present in resource metadata
      throw new Error("Missing OAuth client in resource metadata!");
    }

    const metadata = metadataSchema.parse(resource.metadata);
    if (metadata.writeAction === "create") {
      // Create file
      if (!allowedMimeTypes.includes(metadata.mimeType)) {
        throw new Error("File type not allowed: " + metadata.mimeType);
      }
    } else {
      // Get file metadata before mutating
      const service = google.drive({ version: "v3", auth: authClient });
      const file = await service.files.get({
        fileId: metadata.fileId,
        fields: "mimeType",
      });
      const mimeType = z.string().parse(file.data["mimeType"]);
      if (!allowedMimeTypes.includes(mimeType)) {
        throw new Error("File type not allowed: " + mimeType);
      }
    }

    return resource;
  }

  getSchema(): Schema<Required<RestrictProps>> {
    return {
      folderId: {
        description: "ID of the folder that will contain the file",
      },
      fileTypes: {
        description: "File types that can be written to",
      },
    };
  }
}
