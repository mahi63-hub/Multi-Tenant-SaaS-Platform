DO $$ BEGIN
    CREATE TYPE "enum_projects_status" AS ENUM ('active', 'archived', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "projects" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "enum_projects_status" DEFAULT 'active',
    "created_by" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "projects_tenant_id_idx" ON "projects" ("tenant_id");
CREATE INDEX IF NOT EXISTS "projects_created_by_idx" ON "projects" ("created_by");