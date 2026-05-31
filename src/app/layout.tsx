import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { InstallBanner } from '@/components/layout/InstallBanner'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HealthScan - Know What You Eat',
  description: 'Scan any food product barcode, check ingredients & additives, and get personalised health alerts based on your conditions.',
  keywords: 'food scanner India, ingredient checker, barcode scanner health, food additives India, FSSAI, nutrition tracker',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'HealthScan' },
  openGraph: {
    title: 'HealthScan - Know What You Eat',
    description: 'Scan food barcodes, check ingredients & additives, track nutrition',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <InstallBanner />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-100 mt-8 pb-safe">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-3">
              <Link href="/disclaimer" className="text-xs text-gray-400 hover:text-gray-600">Disclaimer</Link>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</Link>
              <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600">Contact</Link>
            </div>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              ⚕️ General information only. Not medical advice. Consult a healthcare professional.
            </p>
            <p className="text-xs text-gray-300 text-center mt-2">© 2026 HealthScan · tintiinn18@gmail.com</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
