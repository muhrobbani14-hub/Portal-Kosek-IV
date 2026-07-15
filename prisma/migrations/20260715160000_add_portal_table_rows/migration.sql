-- CreateTable
CREATE TABLE "portal_table_rows" (
    "id" TEXT NOT NULL,
    "tableKey" TEXT NOT NULL,
    "rowKey" TEXT NOT NULL,
    "cells" JSONB NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_table_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_table_rows_tableKey_rowKey_key" ON "portal_table_rows"("tableKey", "rowKey");

-- CreateIndex
CREATE INDEX "portal_table_rows_tableKey_displayOrder_idx" ON "portal_table_rows"("tableKey", "displayOrder");
