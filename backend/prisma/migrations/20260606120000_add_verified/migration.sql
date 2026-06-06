-- Add verified badge field to User
ALTER TABLE `User` ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;
