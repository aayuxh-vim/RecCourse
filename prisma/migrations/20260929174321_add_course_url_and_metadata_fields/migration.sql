-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "courseType" TEXT,
ADD COLUMN     "courseUrl" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "prerequisites" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviewCount" INTEGER;
