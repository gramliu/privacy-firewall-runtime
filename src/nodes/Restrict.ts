import Node from "../core/Node";
import Resource from "../core/Resource";
import Schema from "../core/Schema";
import { MapAggregateNode } from "../core";
import z from "zod";
import { OAuth2Client } from "google-auth-library";
import { drive_v3, google } from "googleapis";

export type FileType = "document" | "image" | "text";

export type RestrictProps = {
  path: string;
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
    const { path, fileTypes } = this.getLocalParams();
    const authClient: OAuth2Client | undefined = resource.metadata?.authClient;
    const allowedMimeTypes = fileTypes.flatMap(
      (fileType) => mimeTypeMapping[fileType]
    );

    if (authClient == null) {
      // Require OAuth client to be present in resource metadata
      throw new Error("Missing OAuth client in resource metadata!");
    }

    const metadata = metadataSchema.parse(resource.metadata);

    const service = google.drive({ version: "v3", auth: authClient });
    const folderId = await searchFolder(path, service);
    if (metadata.writeAction === "create") {
      // Create file
      if (!allowedMimeTypes.includes(metadata.mimeType)) {
        throw new Error("File type not allowed: " + metadata.mimeType);
      }

      if (metadata.parent !== folderId) {
        throw new Error(
          `File must be created in folder ${folderId}, not ${metadata.parent}`
        );
      }
    } else {
      // Get file metadata before mutating
      const file = await service.files.get({
        fileId: metadata.fileId,
        fields: "mimeType, parents",
      });
      const mimeType = z.string().parse(file.data["mimeType"]);
      if (!allowedMimeTypes.includes(mimeType)) {
        throw new Error("File type not allowed: " + mimeType);
      }

      const parents = z.array(z.string()).parse(file.data["parents"]);
      if (!parents.includes(folderId)) {
        throw new Error(
          `File must be in folder ${folderId}, not ${parents.join(", ")}`
        );
      }
    }

    return resource;
  }

  getSchema(): Schema<Required<RestrictProps>> {
    return {
      path: {
        description: "Path to the folder that will contain the file",
      },
      fileTypes: {
        description: "File types that can be written to",
      },
    };
  }
}

/**
 * Find the folder ID of a folder given its path
 */
async function searchFolder(path: string, driveService: drive_v3.Drive) {
  const paths = path.split("/");
  let currentFolderId = "root";
  for (const path of paths) {
    const files = await driveService.files.list({
      q: `name = '${path}' and mimeType = 'application/vnd.google-apps.folder' and '${currentFolderId}' in parents`,
      fields: "files(id)",
    });
    if (files.data.files.length === 0) {
      throw new Error(`Folder ${path} does not exist!`);
    }
    currentFolderId = files.data.files[0].id;
  }
  return currentFolderId;
}
