DO $$ BEGIN
    CREATE TYPE "enum_users_role" AS ENUM ('super_admin', 'tenant_admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID REFERENCES "tenants" ("id") ON DELETE CASCADE,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" "enum_users_role" DEFAULT 'user',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_tenant_id_unique" ON "users" ("email", "tenant_id");
CREATE INDEX IF NOT EXISTS "users_tenant_id_idx" ON "users" ("tenant_id");