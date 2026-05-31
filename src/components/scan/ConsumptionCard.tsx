'use client'

import { CheckCircle, XCircle, Clock, Utensils } from 'lucide-react'
import type { ConsumptionStatus } from '@/lib/hooks/useScan'

interface ConsumptionCardProps {
  status: ConsumptionStatus
  productName: string
  onMark: (status: ConsumptionStatus) => void
}

export function ConsumptionCard({ status, productName, onMark }: ConsumptionCardProps) {
  if (status === 'consumed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Logged as Consumed ✓</p>
          <p className="text-xs text-green-600 mt-0.5">Added to your daily nutrition tracker</p>
        </div>
      </div>
    )
  }

  if (status === 'not_consumed') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
        <XCircle className="h-6 w-6 text-gray-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-700">Scan only — not tracked</p>
          <p className="text-xs text-gray-400 mt-0.5">Not counted in your daily log</p>
        </div>
      </div>
    )
  }

  if (status === 'maybe_later') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <Clock className="h-6 w-6 text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Saved for later</p>
          <p className="text-xs text-amber-600 mt-0.5">You can update this from Scan History</p>
        </div>
      </div>
    )
  }

  // pending — show the question
  return (
    <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Utensils className="h-5 w-5 text-blue-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-gray-900">Did you eat / drink this?</p>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Only mark as consumed if you actually ate it — this affects your daily nutrition tracking and chemical exposure log.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onMark('consumed')}
          className="flex flex-col items-center gap-1.5 py-3 px-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-xs font-semibold text-green-700">Yes, I ate it</span>
        </button>
        <button
          onClick={() => onMark('not_consumed')}
          className="flex flex-col items-center gap-1.5 py-3 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
        >
          <XCircle className="h-5 w-5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-600">Just checking</span>
        </button>
        <button
          onClick={() => onMark('maybe_later')}
          className="flex flex-col items-center gap-1.5 py-3 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
        >
          <Clock className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">Maybe later</span>
        </button>
      </div>
    </div>
  )
}
