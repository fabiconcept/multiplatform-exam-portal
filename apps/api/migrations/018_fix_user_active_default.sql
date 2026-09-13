-- The is_active default change is cosmetic (register handler already sets is_active = 0).
-- Rebuilding the table causes FOREIGN KEY issues with payments table.
-- This migration is kept as a no-op for clean version tracking.
-- The is_banned and ban_reason columns already exist from a prior migration.
SELECT 1;
