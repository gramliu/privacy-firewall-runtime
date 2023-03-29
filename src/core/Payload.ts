export type ScalarType = string | number | boolean;

/**
 * A payload carries data that passes through a program
 */
export interface Resource {
  content_type: string;
  metadata?: ResourceData;
  data: ResourceData[];
}

export type ResourceData = Record<string, any>;
