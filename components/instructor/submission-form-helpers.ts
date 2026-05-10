export function cloneForm<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createEmptyLesson(index: number) {
  return {
    id: `lesson-${index + 1}`,
    title: "",
    duration: "10:00",
    isFree: false,
    summary: "",
    videoUrl: "",
    videoMimeType: "video/mp4",
    resources: [],
  };
}

export function createEmptyModule(index: number) {
  return {
    id: `module-${index + 1}`,
    title: "",
    description: "",
    lessons: [createEmptyLesson(0)],
  };
}

export function createEmptyResource() {
  return {
    title: "",
    type: "Material",
    href: "",
  };
}

export function createEmptySupportItem() {
  return {
    title: "",
    description: "",
  };
}

export function createEmptyReview() {
  return {
    name: "",
    role: "",
    rating: 5,
    quote: "",
  };
}
