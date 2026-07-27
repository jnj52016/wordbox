-- Prevent the same question from being recorded more than once in a study session.
CREATE UNIQUE INDEX "AnswerRecord_sessionId_wordId_key" ON "AnswerRecord"("sessionId", "wordId");
