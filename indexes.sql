-- Index untuk tabel transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Index untuk tabel notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Index untuk tabel investor_earnings
CREATE INDEX IF NOT EXISTS idx_investor_earnings_investor_id ON investor_earnings(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_earnings_project_id ON investor_earnings(project_id);

-- Index untuk tabel projects (jika nanti difilter berdasarkan kategori atau status)
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Index untuk tabel rental_revenues
CREATE INDEX IF NOT EXISTS idx_rental_revenues_project_id ON rental_revenues(project_id);
