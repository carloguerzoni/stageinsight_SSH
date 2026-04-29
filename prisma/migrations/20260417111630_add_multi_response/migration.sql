-- CreateTable
CREATE TABLE "MultiResponse" (
    "id" TEXT NOT NULL,
    "surveySessionId" TEXT NOT NULL,
    "questionCode" TEXT NOT NULL,
    "answerLabel" TEXT NOT NULL,

    CONSTRAINT "MultiResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MultiResponse_surveySessionId_questionCode_answerLabel_key" ON "MultiResponse"("surveySessionId", "questionCode", "answerLabel");

-- AddForeignKey
ALTER TABLE "MultiResponse" ADD CONSTRAINT "MultiResponse_surveySessionId_fkey" FOREIGN KEY ("surveySessionId") REFERENCES "SurveySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
