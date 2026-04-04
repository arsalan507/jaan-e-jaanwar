'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Concept, Note, CATEGORY_CONFIG, PET_CONFIG, STATUS_CONFIG, ContentStatus } from '@/lib/types'
import { getConcepts, saveConcept, getStats, updateConceptStatus, getGoldIdeas, getNotes, saveNote, deleteNote, generateId } from '@/lib/store'
import { SEED_CONCEPTS, SEED_GOLD_IDEAS } from '@/lib/seed'
import { saveGoldIdea } from '@/lib/store'

const STATUS_FLOW: ContentStatus[] = ['IDEA', 'APPROVED', 'SCHEDULED', 'SHOT', 'EDITING', 'READY', 'POSTED']

export default function TodayPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<'NOTE' | 'FEEDBACK' | 'IDEA_RAW'>('NOTE')
  const [stats, setStats] = useState({ total: 0, byStatus: {} as Record<string, number>, byCategory: {} as Record<string, number>, todayCount: 0, thisWeekPosted: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const existing = getConcepts()
    if (existing.length === 0) {
      SEED_CONCEPTS.forEach(c => saveConcept(c))
      const existingGold = getGoldIdeas()
      if (existingGold.length === 0) {
        SEED_GOLD_IDEAS.forEach(g => saveGoldIdea(g))
      }
    }
    setConcepts(getConcepts())
    setNotes(getNotes())
    setStats(getStats())
    setMounted(true)
  }, [])

  function refresh() {
    setConcepts(getConcepts())
    setNotes(getNotes())
    setStats(getStats())
  }

  function addNote() {
    if (!noteText.trim()) return
    saveNote({ id: generateId(), text: noteText, type: noteType, createdAt: new Date().toISOString() })
    setNoteText('')
    refresh()
  }

  function removeNote(id: string) {
    deleteNote(id)
    refresh()
  }

  function advanceStatus(id: string) {
    const concept = concepts.find(c => c.id === id)
    if (!concept) return
    const currentIdx = STATUS_FLOW.indexOf(concept.status)
    if (currentIdx < STATUS_FLOW.length - 1) {
      updateConceptStatus(id, STATUS_FLOW[currentIdx + 1])
      refresh()
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayConcepts = concepts.filter(c => c.scheduledDate === today)
  const inPipeline = concepts.filter(c => ['SHOT', 'EDITING', 'READY'].includes(c.status))

  const grouped = todayConcepts.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {} as Record<string, Concept[]>)

  if (!mounted) return <div className="flex items-center justify-center h-screen text-[#9CA3AF]">Loading...</div>

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Jaan-e-Jaanwar</h1>
        <p className="text-[#9CA3AF] text-sm mt-1" dir="rtl">جانِ جانور — Secrets of Animals</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Today's Shoots", value: todayConcepts.length, color: '#10B981' },
          { label: 'This Week Posted', value: stats.thisWeekPosted, color: '#06B6D4' },
          { label: 'Total Concepts', value: stats.total, color: '#8B5CF6' },
          { label: 'In Pipeline', value: inPipeline.length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="bg-[#1A1D27] rounded-xl p-4 border border-[#2A2D37]">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Shoots</h2>
        {todayConcepts.length === 0 ? (
          <div className="bg-[#1A1D27] rounded-xl p-6 border border-[#2A2D37] text-center">
            <p className="text-[#9CA3AF]">No shoots scheduled for today</p>
            <p className="text-xs text-[#9CA3AF] mt-2">Go to Calendar to schedule concepts</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.color }} />
                <span className="text-sm font-medium text-[#9CA3AF]">{CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label}</span>
              </div>
              {items.map(c => (
                <ConceptCard key={c.id} concept={c} onAdvance={advanceStatus} />
              ))}
            </div>
          ))
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Concepts</h2>
        <div className="space-y-2">
          {concepts.slice(0, 5).map(c => (
            <ConceptCard key={c.id} concept={c} onAdvance={advanceStatus} />
          ))}
        </div>
        {concepts.length > 5 && (
          <Link href="/concepts" className="block text-center text-sm text-[#10B981] mt-3 py-2">
            View all {concepts.length} concepts
          </Link>
        )}
      </div>

      {/* Notes & Feedback */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Notes & Feedback</h2>
        <div className="bg-[#1A1D27] rounded-xl p-4 border border-[#2A2D37] space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Quick note, feedback, raw idea..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNote()}
              className="flex-1 bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#10B981] focus:outline-none"
            />
            <button onClick={addNote} className="px-3 py-2 rounded-lg bg-[#10B981] text-black text-sm font-medium flex-shrink-0">+</button>
          </div>
          <div className="flex gap-2">
            {(['NOTE', 'FEEDBACK', 'IDEA_RAW'] as const).map(t => (
              <button key={t} onClick={() => setNoteType(t)}
                className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                  noteType === t ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-[#2A2D37] text-[#9CA3AF]'
                }`}>
                {t === 'NOTE' ? 'Note' : t === 'FEEDBACK' ? 'Feedback' : 'Raw Idea'}
              </button>
            ))}
          </div>
        </div>
        {notes.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(n => (
              <div key={n.id} className="bg-[#1A1D27] rounded-lg px-4 py-3 border border-[#2A2D37] flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      n.type === 'FEEDBACK' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                      n.type === 'IDEA_RAW' ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' :
                      'bg-[#3B82F6]/15 text-[#3B82F6]'
                    }`}>{n.type === 'IDEA_RAW' ? 'Raw Idea' : n.type === 'FEEDBACK' ? 'Feedback' : 'Note'}</span>
                    <span className="text-[10px] text-[#9CA3AF]">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <p className="text-xs text-white">{n.text}</p>
                </div>
                <button onClick={() => removeNote(n.id)} className="text-[#9CA3AF] hover:text-[#EF4444] text-xs flex-shrink-0">x</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/concepts" className="bg-[#1A1D27] border border-[#2A2D37] rounded-xl p-4 text-center hover:border-[#10B981] transition-colors">
          <span className="text-xl">+</span>
          <p className="text-sm text-[#9CA3AF] mt-1">Add Concept</p>
        </Link>
        <Link href="/gold-ideas" className="bg-[#1A1D27] border border-[#2A2D37] rounded-xl p-4 text-center hover:border-[#EAB308] transition-colors">
          <span className="text-xl">&#x1F4A1;</span>
          <p className="text-sm text-[#9CA3AF] mt-1">Add Gold Idea</p>
        </Link>
      </div>
    </div>
  )
}

function ConceptCard({ concept, onAdvance }: { concept: Concept; onAdvance: (id: string) => void }) {
  const cat = CATEGORY_CONFIG[concept.category]
  const status = STATUS_CONFIG[concept.status]

  return (
    <div className="bg-[#1A1D27] rounded-xl p-4 border border-[#2A2D37] mb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
            <h3 className="text-sm font-semibold truncate">{concept.title}</h3>
          </div>
          <p className="text-xs text-[#9CA3AF] line-clamp-1">{concept.hook}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs">{concept.pets.map(p => PET_CONFIG[p]?.emoji).join(' ')}</span>
            {concept.series && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2D37] text-[#9CA3AF]">{concept.series}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onAdvance(concept.id)}
          className="flex-shrink-0 text-[10px] px-2 py-1 rounded-lg font-medium"
          style={{ background: status.color + '20', color: status.color }}
        >
          {status.label} →
        </button>
      </div>
    </div>
  )
}
