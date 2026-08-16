-- DropIndex
DROP INDEX "idx_city_state";

-- DropIndex
DROP INDEX "idx_commission_city_zone";

-- DropIndex
DROP INDEX "idx_commission_effective";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "store_id" UUID;

-- CreateIndex
CREATE INDEX "categories_store_id_idx" ON "categories"("store_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
