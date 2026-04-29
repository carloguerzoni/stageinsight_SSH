-- CreateTable
CREATE TABLE "Ets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveySession" (
    "id" TEXT NOT NULL,
    "etsId" TEXT,
    "schoolYear" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "surveySessionId" TEXT NOT NULL,
    "educationPath" TEXT NOT NULL,
    "classGroup" TEXT,
    "firstExperience" BOOLEAN,
    "stageRole" TEXT,
    "informationSource" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosedResponse" (
    "id" TEXT NOT NULL,
    "surveySessionId" TEXT NOT NULL,
    "questionCode" TEXT NOT NULL,
    "answerLabel" TEXT NOT NULL,
    "numericValue" INTEGER,

    CONSTRAINT "ClosedResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenResponse" (
    "id" TEXT NOT NULL,
    "surveySessionId" TEXT NOT NULL,
    "questionCode" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,

    CONSTRAINT "OpenResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ets_code_key" ON "Ets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_surveySessionId_key" ON "StudentProfile"("surveySessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClosedResponse_surveySessionId_questionCode_key" ON "ClosedResponse"("surveySessionId", "questionCode");

-- CreateIndex
CREATE UNIQUE INDEX "OpenResponse_surveySessionId_questionCode_key" ON "OpenResponse"("surveySessionId", "questionCode");

-- AddForeignKey
ALTER TABLE "SurveySession" ADD CONSTRAINT "SurveySession_etsId_fkey" FOREIGN KEY ("etsId") REFERENCES "Ets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_surveySessionId_fkey" FOREIGN KEY ("surveySessionId") REFERENCES "SurveySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosedResponse" ADD CONSTRAINT "ClosedResponse_surveySessionId_fkey" FOREIGN KEY ("surveySessionId") REFERENCES "SurveySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenResponse" ADD CONSTRAINT "OpenResponse_surveySessionId_fkey" FOREIGN KEY ("surveySessionId") REFERENCES "SurveySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
