import { Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Disclaimer</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 font-medium text-sm leading-relaxed">
            HealthScan provides general educational information about food ingredients and additives only. 
            It is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>

      {[
        { title: 'Not Medical Advice', body: 'The information provided by HealthScan is for general educational and informational purposes only. Nothing on this app should be construed as medical advice or used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician, dietitian, or other qualified health provider with any questions you may have regarding a medical condition or dietary needs.' },
        { title: 'Data Accuracy', body: 'Product data is sourced from Open Food Facts, a crowd-sourced, open-source food database. While we strive for accuracy, product information (ingredients, additives, nutritional values) may be incomplete, outdated, or inaccurate. Always verify information from the product\'s physical label.' },
        { title: 'Additive Risk Scores', body: 'Our additive risk assessments are based on general scientific literature and regulatory databases (EFSA, JECFA, IARC). Risk levels represent population-level assessments and may not apply to your individual health situation. Individual responses to food additives vary significantly.' },
        { title: 'Allergy & Condition Warnings', body: 'Personalized risk warnings based on your health profile are informational only. They do not guarantee safety or danger of any product for your specific situation. If you have severe allergies or serious medical conditions, always consult a healthcare professional and read product labels carefully.' },
        { title: 'No Liability', body: 'HealthScan, its developers, and operators shall not be liable for any health decisions made based on information provided by this app. Use of this app is entirely at your own risk. We expressly disclaim all liability for any adverse health effects or financial losses arising from use of this application.' },
      ].map(s => (
        <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
        </div>
      ))}

      <p className="text-xs text-gray-400 text-center">Last updated: May 2026 · <Link href="/contact" className="underline">Contact us</Link></p>
    </div>
  )
}
