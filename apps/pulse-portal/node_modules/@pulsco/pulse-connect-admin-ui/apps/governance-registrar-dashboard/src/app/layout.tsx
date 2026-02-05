import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Governance Registrar Dashboard - Pulsco Admin',
  description: 'Policy management, compliance oversight, and governance administration for Pulsco',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
