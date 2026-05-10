import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { CourseCaptionTrack, CourseVideoSource } from "@/lib/catalog";

const SUPPORTED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v"] as const;
const QUALITY_ORDER = [1080, 720, 480, 360] as const;

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

function getQualityHeight(fileName: string) {
  const match = fileName
    .toLowerCase()
    .match(/(?:^|[-_.])(1080|720|480|360)p?(?=\.(?:mp4|webm|mov|m4v)$)/);

  return match ? Number(match[1]) : null;
}

function getCaptionMeta(fileName: string, lessonId: string) {
  const normalizedLessonId = lessonId.toLowerCase();
  const lower = fileName.toLowerCase();

  if (!lower.endsWith(".vtt") || !lower.startsWith(normalizedLessonId)) {
    return null;
  }

  const withoutExtension = fileName.slice(0, -4);
  const suffix = withoutExtension
    .slice(lessonId.length)
    .replace(/^[-_.]+/, "")
    .trim();
  const lang = suffix || "uz";
  const labels: Record<string, string> = {
    en: "English",
    ru: "Русский",
    uz: "O'zbek",
  };

  return {
    lang,
    label: labels[lang] ?? lang.toUpperCase(),
  };
}

function findLessonFiles(mediaDirectory: string, lessonId: string) {
  if (!existsSync(mediaDirectory)) {
    return [] as string[];
  }

  const normalizedLessonId = lessonId.toLowerCase();

  return readdirSync(mediaDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().startsWith(normalizedLessonId)
    )
    .map((entry) => entry.name);
}

function buildVideoSources(
  mediaDirectory: string,
  courseId: string,
  lessonId: string
) {
  const files = findLessonFiles(mediaDirectory, lessonId);
  const sources: CourseVideoSource[] = [];
  const seen = new Set<string>();

  for (const fileName of files) {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (
      !extension ||
      !SUPPORTED_VIDEO_EXTENSIONS.includes(
        extension as (typeof SUPPORTED_VIDEO_EXTENSIONS)[number]
      )
    ) {
      continue;
    }

    const src = normalizePath(path.join("/media/courses", courseId, fileName));
    if (seen.has(src)) {
      continue;
    }

    const height = getQualityHeight(fileName);
    const isBaseSource = SUPPORTED_VIDEO_EXTENSIONS.some(
      (videoExtension) => fileName.toLowerCase() === `${lessonId.toLowerCase()}.${videoExtension}`
    );

    if (!height && !isBaseSource) {
      continue;
    }

    seen.add(src);
    sources.push({
      label: height ? `${height}p` : "Source",
      src,
      mimeType: getVideoMimeType(fileName),
      height: height ?? undefined,
    });
  }

  return sources.sort((first, second) => {
    const firstHeight = first.height ?? 0;
    const secondHeight = second.height ?? 0;

    if (firstHeight !== secondHeight) {
      return secondHeight - firstHeight;
    }

    if (first.label === "Source") return 1;
    if (second.label === "Source") return -1;
    return first.label.localeCompare(second.label);
  });
}

function buildCaptionTracks(
  mediaDirectory: string,
  courseId: string,
  lessonId: string
) {
  const files = findLessonFiles(mediaDirectory, lessonId);
  const tracks: CourseCaptionTrack[] = [];

  for (const fileName of files) {
    const meta = getCaptionMeta(fileName, lessonId);
    if (!meta) {
      continue;
    }

    tracks.push({
      label: meta.label,
      src: normalizePath(path.join("/media/courses", courseId, fileName)),
      srcLang: meta.lang,
      default: meta.lang === "uz",
    });
  }

  return tracks.sort((first, second) => {
    if (first.default && !second.default) return -1;
    if (!first.default && second.default) return 1;
    return first.label.localeCompare(second.label);
  });
}

export function resolveLessonMedia(courseId: string, lessonId: string) {
  const mediaDirectory = path.join(
    process.cwd(),
    "public",
    "media",
    "courses",
    courseId
  );

  const videoSources = buildVideoSources(mediaDirectory, courseId, lessonId);
  const captionTracks = buildCaptionTracks(mediaDirectory, courseId, lessonId);

  if (videoSources.length > 0) {
    const primarySource =
      videoSources.find((source) => source.height === QUALITY_ORDER[0]) ??
      videoSources[0];

    return {
      isUploaded: true,
      videoUrl: primarySource.src,
      uploadFilePath: normalizePath(
        path.join("public", "media", "courses", courseId, `${lessonId}.mp4`)
      ),
      videoMimeType: primarySource.mimeType ?? getVideoMimeType(primarySource.src),
      videoSources,
      captionTracks,
    };
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
    videoSources: [
      {
        label: "Source",
        src: normalizePath(
          path.join("/media/courses", courseId, fallbackFileName)
        ),
        mimeType: getVideoMimeType(fallbackFileName),
      },
    ],
    captionTracks,
  };
}
