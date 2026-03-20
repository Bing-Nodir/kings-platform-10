export interface LearnerSnapshot {
  sessionCount: number;
  certCount: number;
  streak: number;
  passedQuizzes: number;
  totalHours: number;
  completedCount: number;
}

export interface LearnerAchievement {
  id: string;
  label: string;
  description: string;
  earned: boolean;
  progress: number;
  target: number;
  tone: "blue" | "amber" | "orange" | "purple" | "emerald";
}

export function buildLearnerAchievements(
  snapshot: LearnerSnapshot
): LearnerAchievement[] {
  return [
    {
      id: "first-lesson",
      label: "Birinchi dars",
      description: "Kamida bitta learning session bilan platformani ishga tushirdingiz.",
      earned: snapshot.sessionCount >= 1,
      progress: snapshot.sessionCount,
      target: 1,
      tone: "blue",
    },
    {
      id: "first-cert",
      label: "Birinchi sertifikat",
      description: "Biror kursni to'liq yakunlab, birinchi credentialni oldingiz.",
      earned: snapshot.certCount >= 1,
      progress: snapshot.certCount,
      target: 1,
      tone: "amber",
    },
    {
      id: "week-streak",
      label: "7 kunlik streak",
      description: "Bir hafta davomida uzluksiz o'rganish ritmini ushlab turdingiz.",
      earned: snapshot.streak >= 7,
      progress: snapshot.streak,
      target: 7,
      tone: "orange",
    },
    {
      id: "quiz-master",
      label: "Quiz ustasi",
      description: "Kamida 5 ta quizni muvaffaqiyatli topshirib, mastery yo'nalishini mustahkamladingiz.",
      earned: snapshot.passedQuizzes >= 5,
      progress: snapshot.passedQuizzes,
      target: 5,
      tone: "purple",
    },
    {
      id: "ten-hours",
      label: "10 soat fokus",
      description: "Platformada kamida 10 soat sifatli learning time yig'dingiz.",
      earned: snapshot.totalHours >= 10,
      progress: snapshot.totalHours,
      target: 10,
      tone: "emerald",
    },
    {
      id: "five-courses",
      label: "5 kurs finisher",
      description: "5 ta kursni yakunlab, kuchli portfolio momentum qurdingiz.",
      earned: snapshot.completedCount >= 5,
      progress: snapshot.completedCount,
      target: 5,
      tone: "blue",
    },
  ];
}

export function getNextAchievement(snapshot: LearnerSnapshot) {
  const pending = buildLearnerAchievements(snapshot).filter(
    (achievement) => !achievement.earned
  );

  if (pending.length === 0) {
    return null;
  }

  return pending.sort((first, second) => {
    const firstRatio = first.progress / first.target;
    const secondRatio = second.progress / second.target;
    return secondRatio - firstRatio;
  })[0];
}

export function calculateLearnerScore(snapshot: Omit<LearnerSnapshot, "certCount" | "sessionCount"> & {
  avgQuizScore?: number;
}) {
  return Math.round(
    snapshot.totalHours * 5 +
      snapshot.completedCount * 20 +
      snapshot.passedQuizzes * 10 +
      snapshot.streak * 3 +
      (snapshot.avgQuizScore ?? 0) * 0.5
  );
}
