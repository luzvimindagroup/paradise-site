/** Is this a database id (UUID)? Used before any lookup by id, so a tampered value never reaches the database. */
export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
