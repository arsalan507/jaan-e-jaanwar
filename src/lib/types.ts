export type ContentCategory = 'GOLD' | 'EDUCATIONAL' | 'EMOTIONAL' | 'CONVERSION'
export type ContentStatus = 'IDEA' | 'APPROVED' | 'SCHEDULED' | 'SHOT' | 'EDITING' | 'READY' | 'POSTED'
export type CastType = 'SOLO' | 'WITH_PETS' | 'COLLAB'
export type Pet = 'BUDGIE' | 'CAT' | 'FISH' | 'CHICK' | 'MULTI'
export type Platform = 'YOUTUBE_SHORTS' | 'YOUTUBE_LONG' | 'INSTAGRAM_REELS' | 'INSTAGRAM_POST'

export interface Concept {
  id: string
  title: string
  hook: string
  description: string
  category: ContentCategory
  cast: CastType
  pets: Pet[]
  platform: Platform[]
  series?: string
  status: ContentStatus
  scheduledDate?: string
  createdAt: string
  updatedAt: string
}

export interface GoldIdea {
  id: string
  sourceUrl: string
  title: string
  hookAnalysis: string
  whyItWorks: string
  adaptation: string
  category: ContentCategory
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  createdAt: string
}

export interface ShootDay {
  date: string
  concepts: string[] // concept IDs
  notes: string
}

export const SERIES_NAMES = [
  'Jaanwar ki Jaan',
  'Paaltu ka Raaz',
  'Ghar ka Zoo',
  'Kharcha Kitna',
  'Galti Mat Karna',
  'Pet vs Pet',
  'Subah ka Scene',
] as const

export const CATEGORY_CONFIG: Record<ContentCategory, { label: string; color: string; emoji: string }> = {
  GOLD: { label: 'Gold', color: '#EAB308', emoji: '🟡' },
  EDUCATIONAL: { label: 'Educational', color: '#3B82F6', emoji: '🔵' },
  EMOTIONAL: { label: 'Emotional', color: '#10B981', emoji: '🟢' },
  CONVERSION: { label: 'Conversion', color: '#EF4444', emoji: '🔴' },
}

export const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string }> = {
  IDEA: { label: 'Idea', color: '#9CA3AF' },
  APPROVED: { label: 'Approved', color: '#8B5CF6' },
  SCHEDULED: { label: 'Scheduled', color: '#3B82F6' },
  SHOT: { label: 'Shot', color: '#F59E0B' },
  EDITING: { label: 'Editing', color: '#F97316' },
  READY: { label: 'Ready', color: '#10B981' },
  POSTED: { label: 'Posted', color: '#06B6D4' },
}

export const PET_CONFIG: Record<Pet, { label: string; emoji: string }> = {
  BUDGIE: { label: 'Budgie', emoji: '🦜' },
  CAT: { label: 'Cat', emoji: '🐱' },
  FISH: { label: 'Fish', emoji: '🐟' },
  CHICK: { label: 'Chick', emoji: '🐤' },
  MULTI: { label: 'Multi', emoji: '🏠' },
}
