ALTER TABLE subscriptions
  ADD COLUMN cancelled_at DATETIME NULL AFTER status,
  ADD COLUMN deleted_at DATETIME NULL AFTER cancelled_at;
