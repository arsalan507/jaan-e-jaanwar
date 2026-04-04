'use client'

import { useEffect, useState } from 'react'
import { Concept, ContentCategory, ContentStatus, CastType, Pet, Platform, CATEGORY_CONFIG, STATUS_CONFIG, PET_CONFIG, SERIES_NAMES } from '@/lib/types'
import { getConcepts, saveConcept, deleteConcept, generateId } from '@/lib/store'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'YOUTUBE_SHORTS', label: 'YT Shorts' },
  { value: 'YOUTUBE_LONG', label: 'YT Long' },
  { value: 'INSTAGRAM_REELS', label: 'IG Reels' },
  { value: 'INSTAGRAM_POST', label: 'IG Post' },
]

export default function ConceptsPage() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [catFilter, setCatFilter] = useState<ContentCategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'ALL'>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const emptyForm = {
    title: '', hook: '', description: '', category: 'GOLD' as ContentCategory,
    cast: 'SOLO' as CastType, pets: ['CAT'] as Pet[], platform: ['YOUTUBE_SHORTS'] as Platform[],
    series: '', status: 'IDEA' as ContentStatus,
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    setConcepts(getConcepts())
    setMounted(true)
  }, [])

  function refresh() { setConcepts(getConcepts()) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const now = new Date().toISOString()
    saveConcept({
      id: editingId || generateId(),
      title: form.title, hook: form.hook, description: form.description,
      category: form.category, cast: form.cast, pets: form.pets,
      platform: form.platform, series: form.series || undefined,
      status: form.status, createdAt: now, updatedAt: now,
    })
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
    refresh()
  }

  function startEdit(c: Concept) {
    setForm({
      title: c.title, hook: c.hook, description: c.description,
      category: c.category, cast: c.cast, pets: c.pets,
      platform: c.platform, series: c.series || '',
      status: c.status,
    })
    setEditingId(c.id)
    setShowForm(true)
    setExpandedId(null)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this concept?')) {
      deleteConcept(id)
      refresh()
    }
  }

  function togglePet(pet: Pet) {
    setForm(f => ({
      ...f,
      pets: f.pets.includes(pet) ? f.pets.filter(p => p !== pet) : [...f.pets, pet],
    }))
  }

  function togglePlatform(p: Platform) {
    setForm(f => ({
      ...f,
      platform: f.platform.includes(p) ? f.platform.filter(x => x !== p) : [...f.platform, p],
    }))
  }

  const filtered = concepts
    .filter(c => catFilter === 'ALL' || c.category === catFilter)
    .filter(c => statusFilter === 'ALL' || c.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (!mounted) return <div className="flex items-center justify-center h-screen text-[#9CA3AF]">Loading...</div>

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Concept Bank</h1>
          <p className="text-xs text-[#9CA3AF]">{concepts.length} total concepts</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
          className="px-3 py-1.5 rounded-lg bg-[#10B981] text-black text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#1A1D27] rounded-xl p-4 border border-[#2A2D37] space-y-3">
          <input type="text" placeholder="Title *" value={form.title} required
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#10B981] focus:outline-none" />
          <input type="text" placeholder="Hook — first 3 seconds"  value={form.hook}
            onChange={e => setForm({ ...form, hook: e.target.value })}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#10B981] focus:outline-none" />
          <textarea placeholder="Description" value={form.description} rows={3}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#10B981] focus:outline-none resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ContentCategory })}
              className="bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
            <select value={form.cast} onChange={e => setForm({ ...form, cast: e.target.value as CastType })}
              className="bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="SOLO">Solo</option>
              <option value="WITH_PETS">With Pets</option>
              <option value="COLLAB">Collab</option>
            </select>
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1.5">Pets</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(PET_CONFIG) as [Pet, { label: string; emoji: string }][]).map(([key, val]) => (
                <button key={key} type="button" onClick={() => togglePet(key)}
                  className={`px-2 py-1 rounded-lg text-xs border ${form.pets.includes(key) ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-[#2A2D37] text-[#9CA3AF]'}`}>
                  {val.emoji} {val.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1.5">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p.value} type="button" onClick={() => togglePlatform(p.value)}
                  className={`px-2 py-1 rounded-lg text-xs border ${form.platform.includes(p.value) ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' : 'border-[#2A2D37] text-[#9CA3AF]'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.series} onChange={e => setForm({ ...form, series: e.target.value })}
              className="bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="">No Series</option>
              {SERIES_NAMES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ContentStatus })}
              className="bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-[#10B981] text-black font-medium text-sm">
            {editingId ? 'Update Concept' : 'Save Concept'}
          </button>
        </form>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {(['ALL', ...Object.keys(CATEGORY_CONFIG)] as const).map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat as ContentCategory | 'ALL')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              catFilter === cat ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-[#2A2D37] text-[#9CA3AF]'
            }`}>
            {cat === 'ALL' ? 'All' : CATEGORY_CONFIG[cat as ContentCategory].emoji + ' ' + CATEGORY_CONFIG[cat as ContentCategory].label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {(['ALL', ...Object.keys(STATUS_CONFIG)] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s as ContentStatus | 'ALL')}
            className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              statusFilter === s ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-[#2A2D37] text-[#9CA3AF]'
            }`}>
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s as ContentStatus].label}
          </button>
        ))}
      </div>

      {/* Concept list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-[#1A1D27] rounded-xl p-6 border border-[#2A2D37] text-center">
            <p className="text-[#9CA3AF]">No concepts match filters</p>
          </div>
        ) : filtered.map(c => {
          const isExpanded = expandedId === c.id
          const cat = CATEGORY_CONFIG[c.category]
          const status = STATUS_CONFIG[c.status]
          return (
            <div key={c.id} className="bg-[#1A1D27] rounded-xl border border-[#2A2D37] overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="w-full text-left p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-sm font-semibold truncate flex-1">{c.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                    style={{ background: status.color + '20', color: status.color }}>{status.label}</span>
                </div>
                <p className="text-xs text-[#9CA3AF] line-clamp-1 pl-4">{c.hook}</p>
                <div className="flex items-center gap-2 mt-1.5 pl-4">
                  <span className="text-xs">{c.pets.map(p => PET_CONFIG[p]?.emoji).join(' ')}</span>
                  {c.series && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2D37] text-[#9CA3AF]">{c.series}</span>}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#2A2D37] pt-3 space-y-2">
                  {c.description && <p className="text-xs text-white">{c.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    {c.platform.map(p => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2D37] text-[#9CA3AF]">
                        {PLATFORMS.find(x => x.value === p)?.label || p}
                      </span>
                    ))}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2D37] text-[#9CA3AF]">{c.cast}</span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => startEdit(c)} className="text-xs text-[#3B82F6]">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-[#EF4444]">Delete</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
