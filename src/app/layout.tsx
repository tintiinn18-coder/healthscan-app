import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HealthScan - Know What You Eat',
  description: 'Scan food products, analyze ingredients, and track your health impact. Make informed choices about what you consume.',
  keywords: 'food scanner, health, nutrition, additives, barcode scanner, clean eating',
  openGraph: {
    title: 'HealthScan - Know What You Eat',
    description: 'Analyze food products for health risks and track your daily nutrition',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        {/* Medical Disclaimer Footer */}
        <footer className="bg-white border-t border-gray-100 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-xs text-gray-400 text-center">
              <strong>Medical Disclaimer:</strong> HealthScan provides general educational information about food ingredients and additives. 
              It is not a substitute for professional medical advice, diagnosis, or treatment. 
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or dietary restrictions. 
              Data sourced from Open Food Facts (crowd-sourced database). Product information may not be complete or accurate.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
