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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Initialize dark mode before first render to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('pf-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (t !== 'light' && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
