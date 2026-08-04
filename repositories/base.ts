/**
 * Soft-delete aware query helpers shared by repositories.
 */

export const NOT_DELETED = { deleted_at: null as null };

export function applySoftDeleteFilter<
  T extends { is: (column: string, value: null) => T },
>(query: T): T {
  return query.is("deleted_at", null);
}
