import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  ScanLine,
  Shield,
  TrendingUp,
  AlertTriangle,
  Zap,
  Heart,
  ChevronRight,
  BarChart3,
  Users,
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: <ScanLine className="h-8 w-8 text-health-blue" />,
      title: 'Scan Products',
      href: '/scan',
      description: 'Point your camera at a barcode or use photo OCR to highlight ingredients and additives that may need caution.',
    },
    {
      icon: <Shield className="h-8 w-8 text-health-green" />,
      title: 'Family Health Profile',
      href: '/family',
      description: 'Set health conditions, allergies, and household preferences for more context-aware label checks.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-health-yellow" />,
      title: 'Weekly Tracking',
      href: '/dashboard',
      description: 'Track recurring exposure events, sugar, sodium, and saturated fat across your scans.',
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-health-red" />,
      title: 'Additives of Concern',
      href: '/scan',
      description: 'See public-source notes for additives with safety questions and review cited context without alarm-heavy wording.',
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-500" />,
      title: 'Better Alternatives',
      href: '/scan',
      description: 'Compare products and look for simpler ingredient lists when a label seems like a poor fit.',
    },
    {
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      title: 'History',
      href: '/history',
      description: 'Keep a running record of labels you have already checked so repeat decisions are faster.',
    },
  ]

  return (
    <div className="space-y-20">
      <section className="text-center py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-health-blue text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Free to use while HealthScan is in active development.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Know More About{' '}
            <span className="text-health-blue">What You Are Eating</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scan packaged foods, review ingredients, nutrition, and additives of concern, and keep a practical record of what you check. Informational only, not medical advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8">
                Start Scanning
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                Try Without Account
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Powered by Open Food Facts data and HealthScan label analysis.</p>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard number="3M+" label="Open Food Facts products" />
        <StatCard number="20+" label="Additives of concern tracked" />
        <StatCard number="4" label="Ways to scan labels" />
        <StatCard number="24/7" label="History and tracking" />
      </section>

      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Review Labels Faster</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Open the scan flow, compare products, and keep track of labels you already checked.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="block h-full">
              <Card className="h-full hover:shadow-lg transition cursor-pointer">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600">A simple flow for barcode, OCR, or manual labels</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Scan', desc: 'Use barcode, camera, OCR, or manual ingredients' },
            { step: '2', title: 'Review', desc: 'See nutrients, additive notes, and source links' },
            { step: '3', title: 'Track', desc: 'Log scan history and repeated exposure events' },
            { step: '4', title: 'Compare', desc: 'Use the result as a practical shopping reference' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-health-blue rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center bg-gradient-to-br from-health-blue to-blue-600 rounded-3xl p-8 md:p-16 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Check Your Next Label?</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Scan a barcode, upload a photo, or type the ingredient list directly when the product is missing from the global database.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            <Button size="lg" className="bg-white text-health-blue hover:bg-gray-100 text-lg px-8">
              Create Account
            </Button>
          </Link>
          <Link href="/scan">
            <Button variant="ghost" size="lg" className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8">
              Open Scanner
            </Button>
          </Link>
        </div>
      </section>

      <section className="text-center">
        <p className="text-sm text-gray-400 mb-6">Data sources and references</p>
        <div className="flex flex-wrap justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Open Food Facts</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">WHO / IARC / UK FSA</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm">User label fallback for missing products</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <Card className="text-center py-6">
      <div className="text-3xl font-bold text-health-blue mb-1">{number}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </Card>
  )
}
