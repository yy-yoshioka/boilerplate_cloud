/*
  Warnings:

  - Made the column `name` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Foo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Foo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Baz" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Baz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qux" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Qux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quux" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quuz" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Quuz_pkey" PRIMARY KEY ("id")
);
