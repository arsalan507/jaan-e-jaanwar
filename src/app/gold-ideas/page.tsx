'use client'

import { useEffect, useState } from 'react'
import { GoldIdea, ContentCategory, CATEGORY_CONFIG } from '@/lib/types'
import { getGoldIdeas, saveGoldIdea, deleteGoldIdea, generateId } from '@/lib/store'

export default function GoldIdeasPage() {
  const [ideas, setIdeas] = useState<GoldIdea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState({
    sourceUrl: '',
    title: '',
    hookAnalysis: '',
    whyItWorks: '',
    adaptation: '',
    category: 'GOLD' as ContentCategory,
    difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
  })

  useEffect(() => {
    setIdeas(getGoldIdeas())
    setMounted(true)
  }, [])

  function refresh() {
    setIdeas(getGoldIdeas())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    saveGoldIdea({
      id: generateId(),
      sourceUrl: form.sourceUrl,
      title: form.title,
      hookAnalysis: form.hookAnalysis,
      whyItWorks: form.whyItWorks,
      adaptation: form.adaptation,
      category: form.category,
      difficulty: form.difficulty,
      createdAt: new Date().toISOString(),
    })
    setForm({ sourceUrl: '', title: '', hookAnalysis: '', whyItWorks: '', adaptation: '', category: 'GOLD', difficulty: 'EASY' })
    setShowForm(false)
    refresh()
  }

  function handleDelete(id: string) {
    if (confirm('Delete this gold idea?')) {
      deleteGoldIdea(id)
      refresh()
    }
  }

  const difficultyColors = { EASY: '#10B981', MEDIUM: '#F59E0B', HARD: '#EF4444' }

  if (!mounted) return <div className="flex items-center justify-center h-screen text-[#9CA3AF]">Loading...</div>

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Gold Ideas</h1>
          <p className="text-xs text-[#9CA3AF]">{ideas.length} ideas in vault</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg bg-[#EAB308] text-black text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Idea'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#1A1D27] rounded-xl p-4 border border-[#2A2D37] space-y-3">
          <input
            type="url"
            placeholder="Source URL (Instagram/YouTube link)"
            value={form.sourceUrl}
            onChange={e => setForm({ ...form, sourceUrl: e.target.value })}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#EAB308] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#EAB308] focus:outline-none"
          />
          <textarea
            placeholder="Hook Analysis — What grabs attention in first 3 seconds?"
            value={form.hookAnalysis}
            onChange={e => setForm({ ...form, hookAnalysis: e.target.value })}
            rows={3}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#EAB308] focus:outline-none resize-none"
          />
          <textarea
            placeholder="Why It Works — Psychology, emotion, format"
            value={form.whyItWorks}
            onChange={e => setForm({ ...form, whyItWorks: e.target.value })}
            rows={3}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#EAB308] focus:outline-none resize-none"
          />
          <textarea
            placeholder="Adaptation — How does Asrar do this with his pets in Dakkani?"
            value={form.adaptation}
            onChange={e => setForm({ ...form, adaptation: e.target.value })}
            rows={3}
            className="w-full bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:border-[#EAB308] focus:outline-none resize-none"
          />
          <div className="flex gap-3">
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as ContentCategory })}
              className="flex-1 bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
            <select
              value={form.difficulty}
              onChange={e => setForm({ ...form, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' })}
              className="flex-1 bg-[#0F1117] border border-[#2A2D37] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-[#EAB308] text-black font-medium text-sm">
            Save Gold Idea
          </button>
        </form>
      )}

      {ideas.length === 0 && !showForm ? (
        <div className="bg-[#1A1D27] rounded-xl p-8 border border-[#2A2D37] text-center">
          <p className="text-2xl mb-2">&#x1F4A1;</p>
          <p className="text-[#9CA3AF]">Paste viral pet video links and analyze what makes them work</p>
          <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 rounded-lg bg-[#EAB308] text-black text-sm font-medium">
            Add First Idea
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {ideas.map(idea => {
            const isExpanded = expandedId === idea.id
            const cat = CATEGORY_CONFIG[idea.category]
            return (
              <div key={idea.id} className="bg-[#1A1D27] rounded-xl border border-[#2A2D37] overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm font-semibold truncate">{idea.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: difficultyColors[idea.difficulty] + '20', color: difficultyColors[idea.difficulty] }}>
                        {idea.difficulty}
                      </span>
                      <span className="text-[#9CA3AF] text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#2A2D37] pt-3">
                    {idea.sourceUrl && (
                      <div>
                        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Source</p>
                        <p className="text-xs text-[#3B82F6] break-all">{idea.sourceUrl}</p>
                      </div>
                    )}
                    {idea.hookAnalysis && (
                      <div>
                        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Hook Analysis</p>
                        <p className="text-xs text-white">{idea.hookAnalysis}</p>
                      </div>
                    )}
                    {idea.whyItWorks && (
                      <div>
                        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Why It Works</p>
                        <p className="text-xs text-white">{idea.whyItWorks}</p>
                      </div>
                    )}
                    {idea.adaptation && (
                      <div>
                        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Jaan-e-Jaanwar Adaptation</p>
                        <p className="text-xs text-white">{idea.adaptation}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="text-xs text-[#EF4444] hover:text-red-300 mt-2"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
