export type ScalarType = string | number | boolean | RegExp;

/**
 * A payload carries data that passes through a program
 */
export default interface Resource {
  resourceType: string;
  metadata?: Record<string, any>;
  data: Record<string, any>[];
}
