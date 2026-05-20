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
  Users
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: <ScanLine className="h-8 w-8 text-health-blue" />,
      title: 'Instant Barcode Scan',
      description: 'Point your camera at any product barcode and get instant health analysis with ingredient breakdowns.'
    },
    {
      icon: <Shield className="h-8 w-8 text-health-green" />,
      title: 'Personalized Risk Alerts',
      description: 'Set your health conditions, allergies, and dietary restrictions. Get warnings specific to YOUR body.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-health-yellow" />,
      title: 'Weekly Health Tracking',
      description: 'Track cumulative chemical exposure, sugar, sodium, and saturated fat across all your scans.'
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-health-red" />,
      title: 'Additive Deep Dive',
      description: 'Learn exactly what E-numbers and additives do, their cancer risks, and which conditions they affect.'
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-500" />,
      title: 'Better Alternatives',
      description: 'Not happy with a product? We suggest healthier alternatives in the same category.'
    },
    {
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      title: 'Family Profiles',
      description: 'Manage health profiles for your whole family - kids, parents, pets - with different risk thresholds.'
    }
  ]

  const howItWorks = [
    { step: '1', title: 'Scan', desc: 'Point camera at any product barcode' },
    { step: '2', title: 'Analyze', desc: 'AI analyzes ingredients against your health profile' },
    { step: '3', title: 'Track', desc: 'See weekly trends and cumulative exposure' },
    { step: '4', title: 'Improve', desc: 'Get personalized recommendations' }
  ]

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-health-blue text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Free forever. No credit card required.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Know Exactly What{' '}
            <span className="text-health-blue">You Are Eating</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Scan any food product, analyze 20+ cancer-linked additives, track your weekly chemical exposure, 
            and get personalized health alerts based on YOUR conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="text-lg px-8">
                Start Scanning Free
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="secondary" size="lg" className="text-lg px-8">
                Try Without Account
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Powered by Open Food Facts database + AI health analysis
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard number="3M+" label="Products in Database" />
        <StatCard number="20+" label="Cancer-Linked Additives Tracked" />
        <StatCard number="100%" label="Free to Use" />
        <StatCard number="24/7" label="Health Tracking" />
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Eat Smarter</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From instant barcode scanning to weekly health reports, HealthScan gives you complete control over your diet.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600">Four simple steps to healthier eating</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {howItWorks.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-health-blue rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-br from-health-blue to-blue-600 rounded-3xl p-8 md:p-16 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Diet?</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of health-conscious people who scan before they eat. 
          Your body will thank you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            <Button size="lg" className="bg-white text-health-blue hover:bg-gray-100 text-lg px-8">
              Create Free Account
            </Button>
          </Link>
          <Link href="/scan">
            <Button variant="ghost" size="lg" className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8">
              Quick Scan
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="text-center">
        <p className="text-sm text-gray-400 mb-6">Trusted data sources & compliance</p>
        <div className="flex flex-wrap justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Open Food Facts</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">EFSA / FDA / IARC Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm">Crowd-Sourced Verification</span>
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
