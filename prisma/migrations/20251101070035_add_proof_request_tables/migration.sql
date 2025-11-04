-- AlterTable
ALTER TABLE "WebhookEvent" ADD COLUMN "proofId" TEXT;

-- CreateTable
CREATE TABLE "ProofRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "proofId" TEXT,
    "connectionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "requestedAttributes" TEXT NOT NULL,
    "presentedAttributes" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProofRequest_sessionId_key" ON "ProofRequest"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProofRequest_proofId_key" ON "ProofRequest"("proofId");

-- CreateIndex
CREATE INDEX "ProofRequest_sessionId_idx" ON "ProofRequest"("sessionId");

-- CreateIndex
CREATE INDEX "ProofRequest_proofId_idx" ON "ProofRequest"("proofId");

-- CreateIndex
CREATE INDEX "ProofRequest_connectionId_idx" ON "ProofRequest"("connectionId");

-- CreateIndex
CREATE INDEX "ProofRequest_status_idx" ON "ProofRequest"("status");

-- CreateIndex
CREATE INDEX "WebhookEvent_proofId_idx" ON "WebhookEvent"("proofId");
