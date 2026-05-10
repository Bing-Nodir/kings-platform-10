import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

export interface SignedCourseMedia {
  lessonId: string;
  videoUrl: string;
  videoMimeType?: string;
  videoSources: Array<{
    label: string;
    src: string;
    mimeType?: string;
  }>;
}

export async function getSignedCourseAssetMedia(courseId: string) {
  try {
    const supabase = createAdminClient();
    const { data: assets, error } = await supabase
      .from("course_assets")
      .select(
        "lesson_id, title, storage_bucket, storage_path, mime_type, asset_type, status, updated_at"
      )
      .eq("course_id", courseId)
      .eq("asset_type", "video")
      .eq("status", "ready")
      .not("lesson_id", "is", null)
      .order("updated_at", { ascending: false });

    if (error || !assets?.length) {
      return new Map<string, SignedCourseMedia>();
    }

    const mediaMap = new Map<string, SignedCourseMedia>();

    for (const asset of assets as Array<{
      lesson_id: string | null;
      title: string | null;
      storage_bucket: string | null;
      storage_path: string | null;
      mime_type: string | null;
    }>) {
      if (!asset.lesson_id || !asset.storage_bucket || !asset.storage_path) {
        continue;
      }

      if (mediaMap.has(asset.lesson_id)) {
        continue;
      }

      const { data: signed } = await supabase.storage
        .from(asset.storage_bucket)
        .createSignedUrl(asset.storage_path, 60 * 60 * 2);

      if (!signed?.signedUrl) {
        continue;
      }

      mediaMap.set(asset.lesson_id, {
        lessonId: asset.lesson_id,
        videoUrl: signed.signedUrl,
        videoMimeType: asset.mime_type ?? "video/mp4",
        videoSources: [
          {
            label: "Secure",
            src: signed.signedUrl,
            mimeType: asset.mime_type ?? "video/mp4",
          },
        ],
      });
    }

    return mediaMap;
  } catch {
    return new Map<string, SignedCourseMedia>();
  }
}
