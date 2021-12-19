/*
  Warnings:

  - A unique constraint covering the columns `[firstMessageId]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "firstMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Thread_firstMessageId_key" ON "Thread"("firstMessageId");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_firstMessageId_fkey" FOREIGN KEY ("firstMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
