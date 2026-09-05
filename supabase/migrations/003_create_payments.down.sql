-- Rollback: renombrar las tablas en vez de eliminarlas
ALTER TABLE payments RENAME TO payments_archived_20250101;
ALTER TABLE payment_access RENAME TO payment_access_archived_20250101;