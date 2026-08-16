-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT', 'CART_DISCOUNT', 'BUY_X_GET_Y_FREE', 'FREE_ITEM_ON_MIN_CART', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('PERCENT_OFF', 'FLAT_OFF', 'FREE_ITEM', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "PaymentGatewayMethod" ADD VALUE 'CASH';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "gst_rate_percent_snapshot" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "offer_type" "OfferType" NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger_min_cart_value" DECIMAL(12,2),
    "trigger_quantity" INTEGER,
    "trigger_is_entire_store" BOOLEAN NOT NULL DEFAULT false,
    "reward_type" "RewardType" NOT NULL,
    "reward_value" DECIMAL(12,2),
    "reward_product_variant_id" UUID,
    "reward_quantity" INTEGER,
    "max_discount_amount" DECIMAL(12,2),
    "max_uses_per_order" INTEGER,
    "max_uses_total" INTEGER,
    "uses_count" INTEGER NOT NULL DEFAULT 0,
    "coupon_code" TEXT,
    "applies_to_pos" BOOLEAN NOT NULL DEFAULT true,
    "applies_to_app" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_trigger_products" (
    "offer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,

    CONSTRAINT "offer_trigger_products_pkey" PRIMARY KEY ("offer_id","product_id")
);

-- CreateTable
CREATE TABLE "offer_trigger_categories" (
    "offer_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "offer_trigger_categories_pkey" PRIMARY KEY ("offer_id","category_id")
);

-- CreateTable
CREATE TABLE "applied_offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL,
    "reward_details" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applied_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "key" TEXT NOT NULL,
    "response_body" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_coupon_code_key" ON "offers"("coupon_code");

-- CreateIndex
CREATE INDEX "offers_store_id_is_active_status_idx" ON "offers"("store_id", "is_active", "status");

-- CreateIndex
CREATE INDEX "offer_trigger_products_offer_id_idx" ON "offer_trigger_products"("offer_id");

-- CreateIndex
CREATE INDEX "offer_trigger_products_product_id_idx" ON "offer_trigger_products"("product_id");

-- CreateIndex
CREATE INDEX "offer_trigger_categories_offer_id_idx" ON "offer_trigger_categories"("offer_id");

-- CreateIndex
CREATE INDEX "applied_offers_order_id_idx" ON "applied_offers"("order_id");

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_reward_product_variant_id_fkey" FOREIGN KEY ("reward_product_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_trigger_products" ADD CONSTRAINT "offer_trigger_products_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_trigger_products" ADD CONSTRAINT "offer_trigger_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_trigger_categories" ADD CONSTRAINT "offer_trigger_categories_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_trigger_categories" ADD CONSTRAINT "offer_trigger_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applied_offers" ADD CONSTRAINT "applied_offers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applied_offers" ADD CONSTRAINT "applied_offers_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateSequence — collision-safe order and invoice numbering (used by db-sequence.util.ts)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1 INCREMENT 1;
