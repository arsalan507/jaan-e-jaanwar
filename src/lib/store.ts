'use client'

import { Concept, GoldIdea, ShootDay, ContentStatus, Note } from './types'

const STORAGE_KEYS = {
  concepts: 'jej-concepts',
  goldIdeas: 'jej-gold-ideas',
  shootDays: 'jej-shoot-days',
  notes: 'jej-notes',
} as const

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Concepts
export function getConcepts(): Concept[] {
  return getItem<Concept[]>(STORAGE_KEYS.concepts, [])
}

export function saveConcept(concept: Concept): void {
  const concepts = getConcepts()
  const idx = concepts.findIndex(c => c.id === concept.id)
  if (idx >= 0) {
    concepts[idx] = { ...concept, updatedAt: new Date().toISOString() }
  } else {
    concepts.push(concept)
  }
  setItem(STORAGE_KEYS.concepts, concepts)
}

export function deleteConcept(id: string): void {
  const concepts = getConcepts().filter(c => c.id !== id)
  setItem(STORAGE_KEYS.concepts, concepts)
}

export function updateConceptStatus(id: string, status: ContentStatus): void {
  const concepts = getConcepts()
  const concept = concepts.find(c => c.id === id)
  if (concept) {
    concept.status = status
    concept.updatedAt = new Date().toISOString()
    setItem(STORAGE_KEYS.concepts, concepts)
  }
}

export function getConceptsByStatus(status: ContentStatus): Concept[] {
  return getConcepts().filter(c => c.status === status)
}

export function getConceptsByCategory(category: string): Concept[] {
  return getConcepts().filter(c => c.category === category)
}

export function getTodayConcepts(): Concept[] {
  const today = new Date().toISOString().split('T')[0]
  return getConcepts().filter(c => c.scheduledDate === today)
}

// Gold Ideas
export function getGoldIdeas(): GoldIdea[] {
  return getItem<GoldIdea[]>(STORAGE_KEYS.goldIdeas, [])
}

export function saveGoldIdea(idea: GoldIdea): void {
  const ideas = getGoldIdeas()
  const idx = ideas.findIndex(i => i.id === idea.id)
  if (idx >= 0) {
    ideas[idx] = idea
  } else {
    ideas.push(idea)
  }
  setItem(STORAGE_KEYS.goldIdeas, ideas)
}

export function deleteGoldIdea(id: string): void {
  const ideas = getGoldIdeas().filter(i => i.id !== id)
  setItem(STORAGE_KEYS.goldIdeas, ideas)
}

// Shoot Days
export function getShootDays(): ShootDay[] {
  return getItem<ShootDay[]>(STORAGE_KEYS.shootDays, [])
}

export function saveShootDay(day: ShootDay): void {
  const days = getShootDays()
  const idx = days.findIndex(d => d.date === day.date)
  if (idx >= 0) {
    days[idx] = day
  } else {
    days.push(day)
  }
  setItem(STORAGE_KEYS.shootDays, days)
}

// Notes
export function getNotes(): Note[] {
  return getItem<Note[]>(STORAGE_KEYS.notes, [])
}

export function saveNote(note: Note): void {
  const notes = getNotes()
  const idx = notes.findIndex(n => n.id === note.id)
  if (idx >= 0) {
    notes[idx] = note
  } else {
    notes.push(note)
  }
  setItem(STORAGE_KEYS.notes, notes)
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id)
  setItem(STORAGE_KEYS.notes, notes)
}

// Stats
export function getStats() {
  const concepts = getConcepts()
  return {
    total: concepts.length,
    byStatus: {
      IDEA: concepts.filter(c => c.status === 'IDEA').length,
      APPROVED: concepts.filter(c => c.status === 'APPROVED').length,
      SCHEDULED: concepts.filter(c => c.status === 'SCHEDULED').length,
      SHOT: concepts.filter(c => c.status === 'SHOT').length,
      EDITING: concepts.filter(c => c.status === 'EDITING').length,
      READY: concepts.filter(c => c.status === 'READY').length,
      POSTED: concepts.filter(c => c.status === 'POSTED').length,
    },
    byCategory: {
      GOLD: concepts.filter(c => c.category === 'GOLD').length,
      EDUCATIONAL: concepts.filter(c => c.category === 'EDUCATIONAL').length,
      EMOTIONAL: concepts.filter(c => c.category === 'EMOTIONAL').length,
      CONVERSION: concepts.filter(c => c.category === 'CONVERSION').length,
    },
    todayCount: getTodayConcepts().length,
    thisWeekPosted: concepts.filter(c => {
      if (c.status !== 'POSTED') return false
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(c.updatedAt) >= weekAgo
    }).length,
  }
}

// Generate unique ID
export function generateId(): string {
  return `jej-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
