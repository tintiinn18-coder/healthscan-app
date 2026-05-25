import { FileText } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', body: 'By accessing or using HealthScan, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our service. These terms apply to all users including registered and guest users.' },
    { title: '2. Description of Service', body: 'HealthScan provides a food product scanning and health information service. We offer barcode scanning, ingredient analysis, nutritional tracking, and personalized health information based on user-provided health profiles. The service is provided "as is" for informational purposes only.' },
    { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and keep it updated. You may not use another person\'s account or share your account with others. You are responsible for all activity under your account.' },
    { title: '4. Health Information Disclaimer', body: 'HealthScan is NOT a medical device, medical service, or healthcare provider. Information provided is for general educational purposes only. We expressly disclaim all liability for health decisions made based on our app. Always consult qualified healthcare professionals for medical advice.' },
    { title: '5. User Conduct', body: 'You agree not to: misuse or attempt to manipulate the service, submit false health information that may mislead others, scrape or bulk-download product data, attempt to reverse engineer the application, or use the service for any commercial purpose without written permission.' },
    { title: '6. Intellectual Property', body: 'HealthScan\'s code, design, branding, and original content are owned by HealthScan. Product data is sourced from Open Food Facts under its open database license. You may not copy, reproduce, or distribute our proprietary content without written consent.' },
    { title: '7. Limitation of Liability', body: 'To the maximum extent permitted by law, HealthScan shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to health outcomes, loss of data, or any other losses arising from your use of the service.' },
    { title: '8. Data Accuracy', body: 'We strive for accuracy but make no warranties about the completeness, reliability, or accuracy of product information. Product data may change and our database may not always reflect current formulations. Always verify information from physical product labels.' },
    { title: '9. Termination', body: 'We reserve the right to terminate or suspend accounts that violate these terms, at our sole discretion and without notice. You may delete your account at any time through the app settings or by contacting us.' },
    { title: '10. Governing Law', body: 'These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India. If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force.' },
    { title: '11. Changes to Terms', body: 'We may revise these Terms at any time. Changes will be posted in the app and significant changes communicated by email. Continued use of the service after changes constitutes acceptance of the new terms.' },
  ]
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm text-gray-500">Please read these terms carefully</p>
        </div>
      </div>
      {sections.map(s => (
        <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center">Last updated: May 2026 · Contact: tintiinn18@gmail.com</p>
    </div>
  )
}
