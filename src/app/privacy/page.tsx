import { FileText, Lock } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const sections = [
    { title: 'Information We Collect', body: 'We collect: (a) account information you provide (email, name); (b) health profile data you voluntarily enter (conditions, allergies, dietary restrictions); (c) scan history (barcodes scanned and results); (d) usage data (pages visited, features used). We do NOT collect precise location, financial information, or sell your data to any third party.' },
    { title: 'How We Use Your Data', body: 'Your data is used solely to: provide personalized health analysis, save your scan history, improve app features, and send important service notifications. We never use your health data for advertising, profiling, or sell it to food companies, insurers, or marketers.' },
    { title: 'Health Data Protection', body: 'Your health conditions, allergies, and dietary data are treated with the highest confidentiality. This data is stored securely in Supabase (SOC 2 certified infrastructure) and is only accessible by you. We do not share this data with any third party.' },
    { title: 'Data Storage & Security', body: 'Data is stored on Supabase infrastructure with industry-standard encryption at rest and in transit. We use Row Level Security to ensure you can only access your own data.' },
    { title: 'Third-Party Services', body: 'We use: Supabase (database & auth), Open Food Facts (product data — open source), Groq (AI analysis — data not retained per their policy), OCR.space (ingredient photo reading — not stored). No advertising SDKs are used.' },
    { title: 'Your Rights', body: 'You may: access all your data, request deletion of your account and all associated data, export your scan history, or correct any information. Contact tintiinn18@gmail.com for any data requests.' },
    { title: 'Children\'s Privacy', body: 'HealthScan is not intended for users under 13. We do not knowingly collect data from children. Family profiles for children should be managed by a parent or guardian account.' },
    { title: 'Changes to This Policy', body: 'We may update this policy as our app evolves. Significant changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.' },
  ]
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Lock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Your data, your control</p>
        </div>
      </div>
      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-blue-800 text-sm font-medium">We do not sell your data. We do not show ads. Your health information is private.</p>
      </div>
      {sections.map(s => (
        <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center">Last updated: May 2026 · Contact: <a href="mailto:tintiinn18@gmail.com" className="underline">tintiinn18@gmail.com</a></p>
    </div>
  )
}
