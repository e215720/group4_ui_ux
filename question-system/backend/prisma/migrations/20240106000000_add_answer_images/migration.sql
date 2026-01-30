-- CreateTable
CREATE TABLE "AnswerImage" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "answerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnswerImage" ADD CONSTRAINT "AnswerImage_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
