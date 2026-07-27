-- Persist the exact word set used by each study session so review sessions
-- remain stable while answering updates nextReviewAt.
CREATE TABLE "StudySessionWord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StudySessionWord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudySessionWord_sessionId_wordId_key"
ON "StudySessionWord"("sessionId", "wordId");

CREATE UNIQUE INDEX "StudySessionWord_sessionId_order_key"
ON "StudySessionWord"("sessionId", "order");

CREATE INDEX "StudySessionWord_wordId_idx"
ON "StudySessionWord"("wordId");

ALTER TABLE "StudySessionWord"
ADD CONSTRAINT "StudySessionWord_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudySessionWord"
ADD CONSTRAINT "StudySessionWord_wordId_fkey"
FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
