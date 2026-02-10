CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID REFERENCES "tenants" ("id") ON DELETE SET NULL,
    "user_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(255) NOT NULL,
    "entity_id" VARCHAR(255),
    "ip_address" VARCHAR(255),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_idx" ON "audit_logs" ("tenant_id");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");