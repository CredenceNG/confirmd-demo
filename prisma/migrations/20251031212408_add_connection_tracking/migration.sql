-- CreateTable
CREATE TABLE "ConnectionSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "invitationUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "connectionId" TEXT,
    "theirDid" TEXT,
    "theirLabel" TEXT,
    "requestType" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "connectionId" TEXT,
    "payload" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionSession_sessionId_key" ON "ConnectionSession"("sessionId");

-- CreateIndex
CREATE INDEX "ConnectionSession_sessionId_idx" ON "ConnectionSession"("sessionId");

-- CreateIndex
CREATE INDEX "ConnectionSession_connectionId_idx" ON "ConnectionSession"("connectionId");

-- CreateIndex
CREATE INDEX "ConnectionSession_status_idx" ON "ConnectionSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_webhookId_key" ON "WebhookEvent"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookEvent_connectionId_idx" ON "WebhookEvent"("connectionId");

-- CreateIndex
CREATE INDEX "WebhookEvent_processed_idx" ON "WebhookEvent"("processed");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");
