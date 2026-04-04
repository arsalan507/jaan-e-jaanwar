'use client'

import { useEffect, useState } from 'react'
import { Concept, CATEGORY_CONFIG, PET_CONFIG } from '@/lib/types'
import { getConcepts, saveConcept } from '@/lib/store'

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CalendarPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConcepts(getConcepts())
    setMounted(true)
  }, [])

  function refresh() { setConcepts(getConcepts()) }

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  function scheduleConcept(conceptId: string, date: string) {
    const concept = concepts.find(c => c.id === conceptId)
    if (!concept) return
    saveConcept({ ...concept, scheduledDate: date, status: concept.status === 'IDEA' ? 'APPROVED' : concept.status === 'APPROVED' ? 'SCHEDULED' : concept.status })
    refresh()
    setShowSchedule(false)
  }

  function unschedule(conceptId: string) {
    const concept = concepts.find(c => c.id === conceptId)
    if (!concept) return
    saveConcept({ ...concept, scheduledDate: undefined })
    refresh()
  }

  const today = formatDate(new Date())
  const weekDays = getWeekDays(weekStart)
  const unscheduled = concepts.filter(c => !c.scheduledDate && ['IDEA', 'APPROVED'].includes(c.status))

  if (!mounted) return <div className="flex items-center justify-center h-screen text-[#9CA3AF]">Loading...</div>

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Shoot Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="w-8 h-8 rounded-lg bg-[#1A1D27] border border-[#2A2D37] text-[#9CA3AF] flex items-center justify-center">←</button>
          <button onClick={nextWeek} className="w-8 h-8 rounded-lg bg-[#1A1D27] border border-[#2A2D37] text-[#9CA3AF] flex items-center justify-center">→</button>
        </div>
      </div>

      {/* Week header */}
      <p className="text-sm text-[#9CA3AF]">
        {weekDays[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {/* Day cards */}
      <div className="space-y-2">
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day)
          const isToday = dateStr === today
          const isSelected = selectedDay === dateStr
          const dayConcepts = concepts.filter(c => c.scheduledDate === dateStr)

          return (
            <div key={dateStr}>
              <button
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${
                  isToday ? 'border-[#10B981] bg-[#10B981]/5' :
                  isSelected ? 'border-[#3B82F6] bg-[#1A1D27]' :
                  'border-[#2A2D37] bg-[#1A1D27]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-center ${isToday ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`}>
                      <p className="text-[10px] font-medium uppercase">{DAY_NAMES[i]}</p>
                      <p className="text-lg font-bold">{day.getDate()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {dayConcepts.map(c => (
                        <span key={c.id} className="w-2 h-2 rounded-full" style={{ background: CATEGORY_CONFIG[c.category].color }} />
                      ))}
                      {dayConcepts.length === 0 && <span className="text-xs text-[#9CA3AF]">No shoots</span>}
                    </div>
                  </div>
                  <span className="text-xs text-[#9CA3AF]">{dayConcepts.length > 0 ? `${dayConcepts.length} shoots` : ''}</span>
                </div>
              </button>

              {/* Expanded day view */}
              {isSelected && (
                <div className="mt-1 ml-4 space-y-2">
                  {dayConcepts.map(c => {
                    const cat = CATEGORY_CONFIG[c.category]
                    return (
                      <div key={c.id} className="bg-[#0F1117] rounded-lg p-3 border border-[#2A2D37] flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                            <span className="text-xs font-semibold truncate">{c.title}</span>
                          </div>
                          <p className="text-[10px] text-[#9CA3AF] mt-1 line-clamp-1 pl-4">{c.hook}</p>
                          <span className="text-[10px] pl-4">{c.pets.map(p => PET_CONFIG[p]?.emoji).join(' ')}</span>
                        </div>
                        <button onClick={() => unschedule(c.id)} className="text-[10px] text-[#EF4444] flex-shrink-0 ml-2">✕</button>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="text-xs text-[#10B981] py-1"
                  >
                    + Schedule a concept
                  </button>
                  {showSchedule && (
                    <div className="bg-[#0F1117] rounded-lg border border-[#2A2D37] p-2 max-h-48 overflow-y-auto space-y-1">
                      {unscheduled.length === 0 ? (
                        <p className="text-xs text-[#9CA3AF] p-2">No unscheduled concepts</p>
                      ) : unscheduled.map(c => (
                        <button key={c.id} onClick={() => scheduleConcept(c.id, dateStr)}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1A1D27] transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_CONFIG[c.category].color }} />
                            <span className="text-xs truncate">{c.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Unscheduled count */}
      <div className="bg-[#1A1D27] rounded-xl p-4 border border-[#2A2D37]">
        <p className="text-sm text-[#9CA3AF]">
          <span className="text-white font-bold">{unscheduled.length}</span> concepts waiting to be scheduled
        </p>
      </div>
    </div>
  )
}
