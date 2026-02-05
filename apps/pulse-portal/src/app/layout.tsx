
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pulsco - Your Digital Marketig Command Centre',
  description: 'Super-Intelligence Grade Location Intelligence Platform | 8-Subsystem Integration | 195+ Countries',
  keywords: ['Pulsco', 'Pulse Connect', 'planetary', 'proximity', 'AI', 'location intelligence'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PulsePortalProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <UnifiedNavigation />
            <PlanetaryStatusBar />
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </PulsePortalProvider>
      </body>
    </html>
  )
}
