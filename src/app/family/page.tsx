'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, User, Baby, Heart, X, Check, Save } from 'lucide-react'

const RELATIONS = ['self', 'child', 'spouse', 'parent', 'grandparent', 'other']
const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Cancer History', 'Pregnancy', 'ADHD', 'Asthma',
  'Migraine', 'Autoimmune', 'IBS', 'Thyroid Issues', 'Liver Disease', 'Kidney Disease',
  'PCOS', 'High Cholesterol', 'Breathing Issues', 'Gluten Intolerance', 'Lactose Intolerance',
  'Obesity', 'Phenylketonuria (PKU)', 'Anxiety / Depression'
]
const ALLERGENS = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Fish', 'Shellfish', 'Wheat / Gluten', 'Soy', 'Sesame', 'Sulfites']

interface Member {
  id: string; name: string; relation: string; age: string
  conditions: string[]; allergies: string[]
}

export default function FamilyPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Member>>({ name: '', relation: 'self', age: '', conditions: [], allergies: [] })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hs_family_members')
      if (stored) setMembers(JSON.parse(stored))
      else setMembers([{ id: '1', name: 'Me', relation: 'self', age: '', conditions: [], allergies: [] }])
    } catch {
      setMembers([{ id: '1', name: 'Me', relation: 'self', age: '', conditions: [], allergies: [] }])
    }
  }, [])

  const persistMembers = (updated: Member[]) => {
    setMembers(updated)
    localStorage.setItem('hs_family_members', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter(i => i !== item) : [...list, item]

  const saveForm = () => {
    if (!form.name?.trim()) return
    let updated: Member[]
    if (adding) {
      updated = [...members, { ...form, id: Date.now().toString() } as Member]
    } else if (editing) {
      updated = members.map(x => x.id === editing ? { ...x, ...form } as Member : x)
    } else return
    persistMembers(updated)
    setAdding(false); setEditing(null)
    setForm({ name: '', relation: 'child', age: '', conditions: [], allergies: [] })
  }

  const removeMember = (id: string) => {
    if (members.find(m => m.id === id)?.relation === 'self') return
    persistMembers(members.filter(x => x.id !== id))
  }

  const startEdit = (m: Member) => {
    setEditing(m.id); setAdding(false)
    setForm({ ...m })
  }

  const colors = ['bg-blue-100 text-blue-600', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600']

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Profiles</h1>
          <p className="text-gray-500 text-sm mt-0.5">Personalised health analysis per family member</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Saved! Profiles will be used on the Scan page.</p>
        </div>
      )}

      <div className="space-y-3">
        {members.map((m, i) => (
          <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[i % colors.length]}`}>
                {m.relation === 'child' ? <Baby className="h-5 w-5" /> : m.relation === 'self' ? <User className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">{m.relation}</span>
                  {m.age && <span className="text-xs text-gray-400">Age {m.age}</span>}
                </div>
                {m.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.conditions.map(c => <span key={c} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">{c}</span>)}
                  </div>
                )}
                {m.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.allergies.map(a => <span key={a} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">⚠️ {a}</span>)}
                  </div>
                )}
                {m.conditions.length === 0 && m.allergies.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No conditions or allergies set</p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(m)} className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Edit</button>
                {m.relation !== 'self' && (
                  <button onClick={() => removeMember(m.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-blue-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">{adding ? 'Add Family Member' : 'Edit Profile'}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
              <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" placeholder="Name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Age</label>
              <input type="number" value={form.age || ''} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" placeholder="Optional" min="0" max="120" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Relation</label>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, relation: r }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize ${form.relation === r ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Health Conditions <span className="text-gray-400 font-normal">(select all that apply)</span></label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => {
                const sel = form.conditions?.includes(c)
                return (
                  <button key={c} onClick={() => setForm(f => ({ ...f, conditions: toggleItem(f.conditions || [], c) }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${sel ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}>
                    {sel && '✓ '}{c}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Allergies</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(a => {
                const sel = form.allergies?.includes(a)
                return (
                  <button key={a} onClick={() => setForm(f => ({ ...f, allergies: toggleItem(f.allergies || [], a) }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${sel ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}>
                    {sel && '⚠️ '}{a}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={saveForm}
              className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />{adding ? 'Add Member' : 'Save Changes'}
            </button>
            <button onClick={() => { setAdding(false); setEditing(null) }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-xs text-blue-700 leading-relaxed text-center">
          ✅ Profiles saved here are automatically available on the <strong>Scan page</strong>. Select a family member before scanning and results will be personalised for their conditions and allergies.
        </p>
      </div>
    </div>
  )
}
