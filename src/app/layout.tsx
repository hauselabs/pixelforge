import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PixelForge — AI Design Tool',
  description:
    'A Surf-enabled AI design tool. Create graphics manually or via Surf commands. Collaborate in real-time.',
  openGraph: {
    title: 'PixelForge',
    description: 'AI design tool powered by the Surf protocol',
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
      <body>{children}</body>
    </html>
  )
}
