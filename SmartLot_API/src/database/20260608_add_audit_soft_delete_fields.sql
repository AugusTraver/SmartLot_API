ALTER TABLE empresas
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "DeleteBy" integer NULL,
    ADD COLUMN IF NOT EXISTS "UpdateBy" integer NULL,
    ADD COLUMN IF NOT EXISTS "DeleteAt" timestamp NULL,
    ADD COLUMN IF NOT EXISTS "UpdateAt" timestamp NULL;

ALTER TABLE empresas
    ALTER COLUMN "DeleteAt" TYPE timestamp USING "DeleteAt"::timestamp,
    ALTER COLUMN "UpdateAt" TYPE timestamp USING "UpdateAt"::timestamp;

ALTER TABLE garages
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;

ALTER TABLE garages
    DROP COLUMN IF EXISTS "DeleteBy",
    DROP COLUMN IF EXISTS "UpdateBy",
    DROP COLUMN IF EXISTS "DeleteAt",
    DROP COLUMN IF EXISTS "UpdateAt";

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "DeleteBy" integer NULL,
    ADD COLUMN IF NOT EXISTS "UpdateBy" integer NULL,
    ADD COLUMN IF NOT EXISTS "DeleteAt" timestamp NULL,
    ADD COLUMN IF NOT EXISTS "UpdateAt" timestamp NULL;

ALTER TABLE usuarios
    ALTER COLUMN "DeleteAt" TYPE timestamp USING "DeleteAt"::timestamp,
    ALTER COLUMN "UpdateAt" TYPE timestamp USING "UpdateAt"::timestamp;

ALTER TABLE sedes
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;

ALTER TABLE marcas
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;

ALTER TABLE modelos
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;

ALTER TABLE roles
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;

ALTER TABLE vehiculos
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;

ALTER TABLE reservas
    ADD COLUMN IF NOT EXISTS "Borrado" boolean NOT NULL DEFAULT false;
