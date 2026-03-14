import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AccessibilityProvider } from '@/components/accessibility-provider'
import { AccessibilityWidget } from '@/components/accessibility-widget'
import { AuthProvider } from '@/components/auth-provider'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: 'Assistly - PWD Volunteer Network',
  description: 'Support for the people, by the people. Connecting students with disabilities to verified volunteers.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <AccessibilityProvider>
            {children}
            <AccessibilityWidget />
            <Toaster position="top-center" richColors />
          </AccessibilityProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
