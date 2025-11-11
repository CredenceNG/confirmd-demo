-- CreateTable
CREATE TABLE "NYSCRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "nationalIdNumber" TEXT NOT NULL,
    "surname" TEXT,
    "othernames" TEXT,
    "matricNumber" TEXT,
    "schoolName" TEXT,
    "programme" TEXT,
    "department" TEXT,
    "dateOfBirth" TEXT,
    "callUpNumber" TEXT,
    "contactAddress" TEXT,
    "contactPhone" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "isServicePersonnel" TEXT,
    "greenCardIssued" BOOLEAN NOT NULL DEFAULT false,
    "greenCardIssuedAt" DATETIME,
    "greenCardCredentialId" TEXT,
    "onboardingSessionId" TEXT,
    "idCardIssued" BOOLEAN NOT NULL DEFAULT false,
    "idCardIssuedAt" DATETIME,
    "idCardCredentialId" TEXT,
    "serviceState" TEXT,
    "serviceStartDate" TEXT,
    "serviceEndDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registration_started',
    "registrationData" TEXT,
    "proofData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NYSCRegistration_sessionId_key" ON "NYSCRegistration"("sessionId");

-- CreateIndex
CREATE INDEX "NYSCRegistration_sessionId_idx" ON "NYSCRegistration"("sessionId");

-- CreateIndex
CREATE INDEX "NYSCRegistration_nationalIdNumber_idx" ON "NYSCRegistration"("nationalIdNumber");

-- CreateIndex
CREATE INDEX "NYSCRegistration_status_idx" ON "NYSCRegistration"("status");

-- CreateIndex
CREATE INDEX "NYSCRegistration_greenCardIssued_idx" ON "NYSCRegistration"("greenCardIssued");

-- CreateIndex
CREATE INDEX "NYSCRegistration_idCardIssued_idx" ON "NYSCRegistration"("idCardIssued");
