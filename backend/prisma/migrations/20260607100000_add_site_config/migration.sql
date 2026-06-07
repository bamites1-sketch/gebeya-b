-- CreateTable
CREATE TABLE "SiteConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("key")
);

-- Seed default payment accounts
INSERT INTO "SiteConfig" ("key", "value", "updatedAt") VALUES
  ('payment_cbe_account',      '1000524532771',  NOW()),
  ('payment_cbe_name',         'Beamlak Tesfahun', NOW()),
  ('payment_telebirr_account', '0975731806',     NOW()),
  ('payment_telebirr_name',    'Beamlak Tesfahun', NOW()),
  ('payment_boa_account',      '',               NOW()),
  ('payment_boa_name',         '',               NOW()),
  ('payment_awash_account',    '',               NOW()),
  ('payment_awash_name',       '',               NOW())
ON CONFLICT ("key") DO NOTHING;
