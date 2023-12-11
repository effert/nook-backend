/*
  Warnings:

  - You are about to drop the column `room_name` on the `Room` table. All the data in the column will be lost.
  - Added the required column `roomName` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Room` DROP COLUMN `room_name`,
    ADD COLUMN `roomName` VARCHAR(191) NOT NULL;
