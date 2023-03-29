export type ScalarType = string | number | boolean;

/**
 * A payload carries data that passes through a program
 */
export default interface Resource {
  contentType: string;
  metadata?: Record<string, any>;
  data: Record<string, any>[];
}
