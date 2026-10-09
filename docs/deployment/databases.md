# Database compatibility

MySQL is the default production database. Flyway migrations are authoritative and Hibernate uses `ddl-auto: validate`.

PostgreSQL: set `SPRING_PROFILES_ACTIVE=production,postgresql`, `DB_URL=jdbc:postgresql://host:5432/dtm`, username and password. Its migration uses SQL identity columns and the same tables/relationships. Relational JSON extension data is stored as TEXT for portability. No dialect-specific JSON operators occur in the Java service.

Run migrations against a fresh target; MySQL data needs an explicit export/import when switching engines. Changing a profile does not migrate existing data.

MongoDB: JPA entities are relational; this build does not claim MongoDB is a drop-in database. Keep MongoDB behind a separate document-store adapter for event exports or external project integration. That adapter is planned, not implemented. The `DocumentStorePort` boundary defines its contract without adding a fake provider.

Hosted review: separate SQL schema and migrations under `db/` and `drizzle/`. This is not the MySQL production database. CMS changes in the review are not automatically synchronized to a separately deployed Java instance. Export reviewed content deliberately before deployment.
