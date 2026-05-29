import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HealthScan - Food Label Scanner',
  description: 'Food label scanner that explains ingredients, nutrition, and additives of concern. Informational only, not medical advice.',
  keywords: 'food scanner India, ingredient checker, barcode scanner, additives of concern, nutrition app, label scanner',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'HealthScan' },
  openGraph: {
    title: 'HealthScan - Food Label Scanner',
    description: 'Scan food barcodes, review ingredients, and compare label details with cited public sources.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-20">{children}</main>
        <footer className="bg-white border-t border-gray-100 mt-8">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
              <Link href="/disclaimer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Medical Disclaimer</Link>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Contact Us</Link>
            </div>
            <p className="text-xs text-gray-500 text-center leading-relaxed max-w-2xl mx-auto">
              <strong className="text-gray-600">Medical Disclaimer:</strong> HealthScan provides general educational information about food labels, ingredients, nutrition, and additives of concern based on available public food-safety sources. It is informational only and not medical advice. Product data may be incomplete or inaccurate.
            </p>
            <p className="text-xs text-gray-300 text-center mt-3">© 2026 HealthScan · tintiinn18@gmail.com</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
