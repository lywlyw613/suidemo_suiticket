import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WalletProvider } from '@/components/WalletProvider'
import { EnokiProvider } from '@/components/EnokiProvider'
import './globals.css'
import '@mysten/dapp-kit/dist/index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NFT Ticketing System',
  description: 'AI-driven conversational NFT ticketing system built on Sui blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <WalletProvider>
          <EnokiProvider>
            {children}
          </EnokiProvider>
        </WalletProvider>
      </body>
    </html>
  )
}

