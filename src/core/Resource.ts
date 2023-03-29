export type ScalarType = string | number | boolean | RegExp;

/**
 * A resource is a collection of data with a content type
 */
export default interface Resource {
  resourceType: string;
  metadata?: ResourceData;
  data: ResourceData[];
}

export type ResourceData = Record<string, any>;
