import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const SUPPORTED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v"] as const;

function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, "/");
}

export function getVideoMimeType(filePath?: string) {
  const extension = filePath?.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/mp4";
    case "mp4":
    default:
      return "video/mp4";
  }
}

export function resolveLessonMedia(courseId: string, lessonId: string) {
  const mediaDirectory = path.join(
    process.cwd(),
    "public",
    "media",
    "courses",
    courseId
  );

  for (const extension of SUPPORTED_VIDEO_EXTENSIONS) {
    const fileName = `${lessonId}.${extension}`;
    const absolutePath = path.join(mediaDirectory, fileName);

    if (existsSync(absolutePath)) {
      return {
        isUploaded: true,
        videoUrl: normalizePath(path.join("/media/courses", courseId, fileName)),
        uploadFilePath: normalizePath(
          path.join("public", "media", "courses", courseId, fileName)
        ),
        videoMimeType: getVideoMimeType(fileName),
      };
    }
  }

  if (existsSync(mediaDirectory)) {
    const matchingFile = readdirSync(mediaDirectory, { withFileTypes: true })
      .find(
        (entry) =>
          entry.isFile() &&
          entry.name.toLowerCase().startsWith(`${lessonId.toLowerCase()}.`)
      )
      ?.name;

    if (matchingFile) {
      return {
        isUploaded: true,
        videoUrl: normalizePath(
          path.join("/media/courses", courseId, matchingFile)
        ),
        uploadFilePath: normalizePath(
          path.join("public", "media", "courses", courseId, matchingFile)
        ),
        videoMimeType: getVideoMimeType(matchingFile),
      };
    }
  }

  const fallbackFileName = `${lessonId}.mp4`;

  return {
    isUploaded: false,
    videoUrl: normalizePath(
      path.join("/media/courses", courseId, fallbackFileName)
    ),
    uploadFilePath: normalizePath(
      path.join("public", "media", "courses", courseId, fallbackFileName)
    ),
    videoMimeType: getVideoMimeType(fallbackFileName),
  };
}
