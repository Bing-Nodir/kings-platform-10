export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  company_name: string | null
  language_pref: 'uz' | 'ru' | 'en'
  role: 'student' | 'admin' | null
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  progress_percent: number
  last_accessed_at: string | null
  completed_at: string | null
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  issued_at: string
}

export interface LearningSession {
  id: string
  user_id: string
  course_id: string
  duration_minutes: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  course_id: string
  score: number
  total: number
  percent: number
  passed: boolean
  answers: { qId: string; ans: string }[]
  completed_at: string
}

export interface UserNote {
  id: string
  user_id: string
  course_id: string
  content: string
  updated_at: string
}

export interface AiConversation {
  id: string
  user_id: string
  course_id: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  updated_at: string
}
