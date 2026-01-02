import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WalletProvider } from '@/components/WalletProvider'
import { EnokiProvider } from '@/components/EnokiProvider'
import './globals.css'
import '@mysten/dapp-kit/dist/index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NFT 票務系統',
  description: '基於 Sui 的 AI 驅動對話式 NFT 票務系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <WalletProvider>
          <EnokiProvider>
            {children}
          </EnokiProvider>
        </WalletProvider>
      </body>
    </html>
  )
}

