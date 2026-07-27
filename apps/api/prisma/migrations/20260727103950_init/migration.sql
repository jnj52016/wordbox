-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('NEW', 'LEARNING', 'MASTERED');

-- CreateEnum
CREATE TYPE "StudyMode" AS ENUM ('LEARN', 'REVIEW');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('EN_TO_ZH', 'ZH_TO_EN', 'SPELLING');

-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL,
    "publicId" VARCHAR(64) NOT NULL,
    "dailyGoal" INTEGER NOT NULL DEFAULT 10,
    "autoPronounce" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Learner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordBook" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "level" VARCHAR(64),
    "coverColor" VARCHAR(32),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "wordBookId" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "spelling" VARCHAR(128) NOT NULL,
    "phonetic" VARCHAR(128),
    "meaning" TEXT NOT NULL,
    "partOfSpeech" VARCHAR(64),
    "example" TEXT,
    "exampleZh" TEXT,
    "imageUrl" TEXT,
    "emoji" VARCHAR(32),
    "order" INTEGER NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordProgress" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "status" "WordStatus" NOT NULL DEFAULT 'NEW',
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "unitId" TEXT,
    "mode" "StudyMode" NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "submittedAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Learner_publicId_key" ON "Learner"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "WordBook_slug_key" ON "WordBook"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_wordBookId_order_key" ON "Unit"("wordBookId", "order");

-- CreateIndex
CREATE INDEX "Word_spelling_idx" ON "Word"("spelling");

-- CreateIndex
CREATE UNIQUE INDEX "Word_unitId_order_key" ON "Word"("unitId", "order");

-- CreateIndex
CREATE INDEX "WordProgress_nextReviewAt_idx" ON "WordProgress"("nextReviewAt");

-- CreateIndex
CREATE INDEX "WordProgress_learnerId_nextReviewAt_idx" ON "WordProgress"("learnerId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "WordProgress_learnerId_wordId_key" ON "WordProgress"("learnerId", "wordId");

-- CreateIndex
CREATE INDEX "AnswerRecord_sessionId_idx" ON "AnswerRecord"("sessionId");

-- CreateIndex
CREATE INDEX "AnswerRecord_wordId_idx" ON "AnswerRecord"("wordId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_wordBookId_fkey" FOREIGN KEY ("wordBookId") REFERENCES "WordBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerRecord" ADD CONSTRAINT "AnswerRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerRecord" ADD CONSTRAINT "AnswerRecord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
