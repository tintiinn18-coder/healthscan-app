import { Mail, MessageSquare, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-500 mt-1">We usually respond within 24 hours</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email (all enquiries)</p>
            <a href="mailto:tintiinn18@gmail.com" className="text-blue-600 font-medium hover:underline">tintiinn18@gmail.com</a>
          </div>
        </div>

        {[
          { icon: Shield, title: 'Privacy / Data Requests', body: 'To request data deletion, export, or report a privacy concern, email us with subject: "Data Request"' },
          { icon: MessageSquare, title: 'Bug Reports & Feedback', body: 'Found a product showing wrong info? Scanner not working? Please describe the issue and include the product barcode.' },
          { icon: Clock, title: 'Response Time', body: 'We are a small team. We aim to respond within 24–48 hours on weekdays. For urgent issues, mention "URGENT" in your subject line.' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.title} className="flex gap-3">
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-0.5">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-500">
          <strong>HealthScan</strong> is an independent project. It is not affiliated with any food brand, health authority, or government body.
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/disclaimer" className="text-xs text-blue-500 hover:underline">Disclaimer</Link>
          <Link href="/privacy" className="text-xs text-blue-500 hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-blue-500 hover:underline">Terms</Link>
        </div>
      </div>
    </div>
  )
}
