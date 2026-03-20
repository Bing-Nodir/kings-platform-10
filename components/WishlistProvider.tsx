"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface ToggleWishlistResult {
  ok: boolean;
  authRequired?: boolean;
  error?: string;
}

interface WishlistContextValue {
  courseIds: string[];
  isAuthenticated: boolean;
  loading: boolean;
  backendReady: boolean;
  isSaved: (courseId: string) => boolean;
  isMutating: (courseId: string) => boolean;
  toggleWishlist: (courseId: string) => Promise<ToggleWishlistResult>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function addMutatingId(previous: Set<string>, courseId: string) {
  const next = new Set(previous);
  next.add(courseId);
  return next;
}

function removeMutatingId(previous: Set<string>, courseId: string) {
  const next = new Set(previous);
  next.delete(courseId);
  return next;
}

export function WishlistProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(true);
  const [mutatingCourseIds, setMutatingCourseIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    let isActive = true;

    async function loadWishlist() {
      setLoading(true);

      try {
        const response = await fetch("/api/wishlist", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!isActive) {
          return;
        }

        if (response.status === 401) {
          setCourseIds([]);
          setIsAuthenticated(false);
          setBackendReady(true);
          return;
        }

        const payload = (await response.json().catch(() => null)) as
          | { courseIds?: string[]; backendReady?: boolean }
          | null;

        if (!response.ok) {
          setCourseIds([]);
          setBackendReady(false);
          return;
        }

        setCourseIds(payload?.courseIds ?? []);
        setBackendReady(payload?.backendReady ?? true);
        setIsAuthenticated(true);
      } catch {
        if (!isActive) {
          return;
        }

        setCourseIds([]);
        setBackendReady(false);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadWishlist();

    return () => {
      isActive = false;
    };
  }, [pathname]);

  async function toggleWishlist(courseId: string): Promise<ToggleWishlistResult> {
    const alreadySaved = courseIds.includes(courseId);

    setMutatingCourseIds((previous) => addMutatingId(previous, courseId));
    setCourseIds((previous) =>
      alreadySaved
        ? previous.filter((id) => id !== courseId)
        : [...new Set([...previous, courseId])]
    );

    try {
      const response = await fetch("/api/wishlist", {
        method: alreadySaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ courseId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (response.status === 401) {
        setIsAuthenticated(false);
        setCourseIds((previous) =>
          alreadySaved
            ? [...new Set([...previous, courseId])]
            : previous.filter((id) => id !== courseId)
        );
        return { ok: false, authRequired: true };
      }

      if (!response.ok) {
        setCourseIds((previous) =>
          alreadySaved
            ? [...new Set([...previous, courseId])]
            : previous.filter((id) => id !== courseId)
        );

        if (response.status === 503) {
          setBackendReady(false);
        }

        return {
          ok: false,
          error: payload?.error ?? "Wishlistni yangilashda muammo yuz berdi.",
        };
      }

      setIsAuthenticated(true);
      startTransition(() => {
        router.refresh();
      });

      return { ok: true };
    } catch {
      setCourseIds((previous) =>
        alreadySaved
          ? [...new Set([...previous, courseId])]
          : previous.filter((id) => id !== courseId)
      );

      return {
        ok: false,
        error: "Wishlistga ulanishda muammo yuz berdi.",
      };
    } finally {
      setMutatingCourseIds((previous) => removeMutatingId(previous, courseId));
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        courseIds,
        isAuthenticated,
        loading,
        backendReady,
        isSaved: (courseId) => courseIds.includes(courseId),
        isMutating: (courseId) => mutatingCourseIds.has(courseId),
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
