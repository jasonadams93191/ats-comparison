import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATS Platform Comparison — Deel vs. Asymbl',
  description: 'Applicant Tracking System evaluation for staffing operations: Deel vs. Asymbl (Salesforce-native)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
