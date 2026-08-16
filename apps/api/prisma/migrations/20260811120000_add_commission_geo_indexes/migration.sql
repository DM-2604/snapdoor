CREATE INDEX IF NOT EXISTS idx_commission_city_zone ON "commission_rules"("city_id", "zone_id");
CREATE INDEX IF NOT EXISTS idx_commission_effective ON "commission_rules"("effective_from", "effective_to");
CREATE INDEX IF NOT EXISTS idx_city_state ON "cities"("state");
