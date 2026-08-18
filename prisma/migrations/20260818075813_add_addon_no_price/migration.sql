-- Adds a separate price for the "No" branch of TOGGLE (Yes/No) addon groups.
-- `price` continues to mean the "Yes" surcharge; `noPrice` defaults to 0
-- (existing TOGGLE groups keep charging nothing for "No", unchanged).
ALTER TABLE "ProductAddon" ADD COLUMN "noPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;
