-- CreateTable
CREATE TABLE "User" (
    "publicKey" TEXT NOT NULL,
    "twitterId" TEXT NOT NULL,
    "twitterHandle" TEXT NOT NULL,
    "twitterProfileImage" TEXT NOT NULL,
    "verificationTweetId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("publicKey")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "msgBody" TEXT NOT NULL,
    "serializedProof" TEXT NOT NULL,
    "serializedPublicSignals" TEXT NOT NULL,
    "msgAttestation" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reveal" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serializedProof" TEXT NOT NULL,
    "serializedPublicSignals" TEXT NOT NULL,
    "userPublicKey" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "Reveal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deny" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serializedProof" TEXT NOT NULL,
    "serializedPublicSignals" TEXT NOT NULL,
    "userPublicKey" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "Deny_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_group" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterId_key" ON "User"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterHandle_key" ON "User"("twitterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationTweetId_key" ON "User"("verificationTweetId");

-- CreateIndex
CREATE UNIQUE INDEX "Reveal_messageId_key" ON "Reveal"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "_group_AB_unique" ON "_group"("A", "B");

-- CreateIndex
CREATE INDEX "_group_B_index" ON "_group"("B");

-- AddForeignKey
ALTER TABLE "Reveal" ADD CONSTRAINT "Reveal_userPublicKey_fkey" FOREIGN KEY ("userPublicKey") REFERENCES "User"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reveal" ADD CONSTRAINT "Reveal_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deny" ADD CONSTRAINT "Deny_userPublicKey_fkey" FOREIGN KEY ("userPublicKey") REFERENCES "User"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deny" ADD CONSTRAINT "Deny_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group" ADD FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group" ADD FOREIGN KEY ("B") REFERENCES "User"("publicKey") ON DELETE CASCADE ON UPDATE CASCADE;
