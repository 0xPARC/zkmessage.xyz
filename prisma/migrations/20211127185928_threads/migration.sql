/*
  Warnings:

  - You are about to drop the column `msgAttestation` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `msgBody` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `serializedProof` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `serializedPublicSignals` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Deny` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reveal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `body` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proof` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicSignals` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threadId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Deny" DROP CONSTRAINT "Deny_messageId_fkey";

-- DropForeignKey
ALTER TABLE "Deny" DROP CONSTRAINT "Deny_userPublicKey_fkey";

-- DropForeignKey
ALTER TABLE "Reveal" DROP CONSTRAINT "Reveal_messageId_fkey";

-- DropForeignKey
ALTER TABLE "Reveal" DROP CONSTRAINT "Reveal_userPublicKey_fkey";

-- DropForeignKey
ALTER TABLE "_group" DROP CONSTRAINT "_group_A_fkey";

-- DropIndex
DROP INDEX "User_verificationTweetId_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "msgAttestation",
DROP COLUMN "msgBody",
DROP COLUMN "serializedProof",
DROP COLUMN "serializedPublicSignals",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "hash" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "proof" JSONB NOT NULL,
ADD COLUMN     "publicSignals" JSONB NOT NULL,
ADD COLUMN     "threadId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Deny";

-- DropTable
DROP TABLE "Reveal";

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group" ADD FOREIGN KEY ("A") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
