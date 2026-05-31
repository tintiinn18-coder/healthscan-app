'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const dismissed = localStorage.getItem('hs_install_dismissed')
    if (dismissed) return

    // iOS detection
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)
    if (ios) {
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    // Android / Chrome - listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('hs_install_dismissed', '1')
  }

  if (!showBanner || isInstalled) return null

  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
      <Smartphone className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {isIOS ? (
          <div>
            <p className="text-sm font-semibold">Install HealthScan on iPhone</p>
            <p className="text-xs text-blue-100 mt-0.5">Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for app experience</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">Install HealthScan App</p>
            <p className="text-xs text-blue-100 mt-0.5">Add to home screen — works like a real Android app</p>
          </div>
        )}
      </div>
      {!isIOS && (
        <button onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors flex-shrink-0">
          <Download className="h-3.5 w-3.5" /> Install
        </button>
      )}
      <button onClick={handleDismiss} className="p-1 hover:bg-blue-500 rounded-lg transition-colors flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
