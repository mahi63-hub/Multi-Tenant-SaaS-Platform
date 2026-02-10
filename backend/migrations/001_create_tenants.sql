CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE "enum_tenants_status" AS ENUM ('active', 'suspended', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_tenants_subscription_plan" AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "tenants" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(255) NOT NULL UNIQUE,
    "status" "enum_tenants_status" DEFAULT 'active',
    "subscription_plan" "enum_tenants_subscription_plan" DEFAULT 'free',
    "max_users" INTEGER DEFAULT 5,
    "max_projects" INTEGER DEFAULT 3,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "tenants_subdomain_idx" ON "tenants" ("subdomain");