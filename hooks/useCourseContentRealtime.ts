"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface CourseContentEvent {
  id: string;
  course_id: string;
  lesson_id: string | null;
  event_type: "CONTENT_UPDATE" | "COURSE_PUBLISHED" | "ASSET_READY" | "ASSET_FAILED";
  payload: Record<string, unknown>;
  created_at: string;
}

export function useCourseContentRealtime(courseId: string, enabled = true) {
  const [latestEvent, setLatestEvent] = useState<CourseContentEvent | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!enabled || !courseId) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`course-content:${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "course_content_events",
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          const event = payload.new as CourseContentEvent;
          setLatestEvent(event);
          setRevision((current) => current + 1);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [courseId, enabled]);

  return { latestEvent, revision };
}
