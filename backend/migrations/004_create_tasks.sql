DO $$ BEGIN
    CREATE TYPE "enum_tasks_status" AS ENUM ('todo', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_tasks_priority" AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
    "tenant_id" UUID NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "enum_tasks_status" DEFAULT 'todo',
    "priority" "enum_tasks_priority" DEFAULT 'medium',
    "assigned_to" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "due_date" DATE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "tasks_tenant_id_idx" ON "tasks" ("tenant_id");
CREATE INDEX IF NOT EXISTS "tasks_project_id_idx" ON "tasks" ("project_id");
CREATE INDEX IF NOT EXISTS "tasks_assigned_to_idx" ON "tasks" ("assigned_to");