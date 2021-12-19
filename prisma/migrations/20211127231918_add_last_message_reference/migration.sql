/*
  Warnings:

  - A unique constraint covering the columns `[lastMessageId]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "lastMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Thread_lastMessageId_key" ON "Thread"("lastMessageId");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
