-- CreateTable
CREATE TABLE "LoanApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "admissionNumber" TEXT,
    "programme" TEXT,
    "graduationYear" TEXT,
    "surname" TEXT,
    "othernames" TEXT,
    "schoolName" TEXT,
    "department" TEXT,
    "matricNumber" TEXT,
    "nationalIdNumber" TEXT,
    "bankVerificationNumber" TEXT,
    "schoolNucNumber" TEXT,
    "jambNumber" TEXT,
    "dateOfBirth" TEXT,
    "dateIssued" TEXT,
    "dateExpiry" TEXT,
    "loanAmount" REAL,
    "loanPurpose" TEXT,
    "accountNumber" TEXT,
    "bankName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "approvedAmount" REAL,
    "verifiedCredentials" TEXT,
    "applicationData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LoanApplication_sessionId_key" ON "LoanApplication"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanApplication_applicationNumber_key" ON "LoanApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "LoanApplication_sessionId_idx" ON "LoanApplication"("sessionId");

-- CreateIndex
CREATE INDEX "LoanApplication_applicationNumber_idx" ON "LoanApplication"("applicationNumber");

-- CreateIndex
CREATE INDEX "LoanApplication_status_idx" ON "LoanApplication"("status");

-- CreateIndex
CREATE INDEX "LoanApplication_admissionNumber_idx" ON "LoanApplication"("admissionNumber");

-- CreateIndex
CREATE INDEX "LoanApplication_submittedAt_idx" ON "LoanApplication"("submittedAt");
