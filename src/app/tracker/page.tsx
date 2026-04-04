'use client'

import { useEffect, useState } from 'react'
import { Concept, ContentStatus, CATEGORY_CONFIG, PET_CONFIG, STATUS_CONFIG } from '@/lib/types'
import { getConcepts, updateConceptStatus } from '@/lib/store'

const COLUMNS: ContentStatus[] = ['APPROVED', 'SCHEDULED', 'SHOT', 'EDITING', 'READY', 'POSTED']

export default function TrackerPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConcepts(getConcepts())
    setMounted(true)
  }, [])

  function refresh() {
    setConcepts(getConcepts())
  }

  function advance(id: string) {
    const concept = concepts.find(c => c.id === id)
    if (!concept) return
    const idx = COLUMNS.indexOf(concept.status)
    if (idx < COLUMNS.length - 1) {
      updateConceptStatus(id, COLUMNS[idx + 1])
      refresh()
    }
  }

  function goBack(id: string) {
    const concept = concepts.find(c => c.id === id)
    if (!concept) return
    const idx = COLUMNS.indexOf(concept.status)
    if (idx > 0) {
      updateConceptStatus(id, COLUMNS[idx - 1])
      refresh()
    }
  }

  if (!mounted) return <div className="flex items-center justify-center h-screen text-[#9CA3AF]">Loading...</div>

  return (
    <div className="max-w-full mx-auto">
      <h1 className="text-xl font-bold mb-4">Production Tracker</h1>

      {/* Pipeline summary */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {COLUMNS.map(status => {
          const count = concepts.filter(c => c.status === status).length
          const cfg = STATUS_CONFIG[status]
          return (
            <div key={status} className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#1A1D27] border border-[#2A2D37]">
              <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span className="text-xs text-[#9CA3AF]">{cfg.label}</span>
              <span className="text-xs font-bold" style={{ color: cfg.color }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Kanban columns - horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {COLUMNS.map(status => {
          const items = concepts.filter(c => c.status === status)
          const cfg = STATUS_CONFIG[status]
          return (
            <div
              key={status}
              className="flex-shrink-0 w-[280px] snap-start bg-[#1A1D27] rounded-xl border border-[#2A2D37] p-3"
              style={{ borderTopColor: cfg.color, borderTopWidth: '2px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</h3>
                <span className="text-xs bg-[#2A2D37] px-2 py-0.5 rounded-full text-[#9CA3AF]">{items.length}</span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {items.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] text-center py-4">Empty</p>
                ) : (
                  items.map(c => {
                    const cat = CATEGORY_CONFIG[c.category]
                    return (
                      <div key={c.id} className="bg-[#0F1117] rounded-lg p-3 border border-[#2A2D37]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                          <span className="text-xs font-semibold truncate">{c.title}</span>
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] line-clamp-2 mb-2">{c.hook}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{c.pets.map(p => PET_CONFIG[p]?.emoji).join(' ')}</span>
                          <div className="flex gap-1">
                            {COLUMNS.indexOf(status) > 0 && (
                              <button
                                onClick={() => goBack(c.id)}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#2A2D37] text-[#9CA3AF] hover:text-white"
                              >
                                ←
                              </button>
                            )}
                            {COLUMNS.indexOf(status) < COLUMNS.length - 1 && (
                              <button
                                onClick={() => advance(c.id)}
                                className="text-[10px] px-2 py-0.5 rounded font-medium"
                                style={{ background: cfg.color + '20', color: cfg.color }}
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
