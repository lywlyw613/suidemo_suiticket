'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDemoEvents } from '@/lib/demoEvents';

export default function Home() {
  const router = useRouter();

  // 移除自動重定向邏輯，讓用戶可以自由訪問首頁
  // 重定向應該只在登入頁面或登入回調頁面進行

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/events"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/login"
              className="btn-primary text-sm"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-white py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.08),transparent_50%)]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Ticketing on
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Sui Blockchain</span>
            </h2>
            <p className="text-xl text-gray-800 mb-10 leading-relaxed">
              Secure, transparent, and decentralized NFT ticketing system<br />
              Providing seamless experiences for event organizers and participants
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/events"
                className="btn-primary text-lg px-8 py-4"
              >
                Explore Events
              </Link>
              <Link
                href="/login"
                className="btn-outline text-lg px-8 py-4"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
            <p className="text-lg text-gray-800">Get started with NFT Ticketing System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Customer */}
            <Link 
              href="/login?role=customer" 
              className="card-hover group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-soft">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ticket Buyer</h3>
                <p className="text-gray-800 mb-6">Browse events and purchase NFT tickets</p>
                <span className="text-primary-600 font-semibold group-hover:text-primary-700 inline-flex items-center gap-2">
                  Start Shopping
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Organizer */}
            <Link 
              href="/login?role=organizer" 
              className="card-hover group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-soft">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Event Organizer</h3>
                <p className="text-gray-800 mb-6">Create events and manage tickets</p>
                <span className="text-secondary-600 font-semibold group-hover:text-secondary-700 inline-flex items-center gap-2">
                  Start Managing
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Verifier */}
            <Link 
              href="/login?role=verifier" 
              className="card-hover group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-soft">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ticket Verifier</h3>
                <p className="text-gray-800 mb-6">Scan QR codes and verify tickets</p>
                <span className="text-accent-600 font-semibold group-hover:text-accent-700 inline-flex items-center gap-2">
                  Start Verifying
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Event</h2>
            <p className="text-lg text-gray-800">Experience the future of ticketing</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Link
              href="/events/demo-taipei-jazz-2026"
              className="block card-hover group"
            >
              <div className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
                      Music
                    </div>
                    <h3 className="text-3xl font-bold mb-3">Taipei Neo-Jazz Night 2026: Rhythms of the City</h3>
                    <p className="text-lg opacity-90 mb-4">
                      Immerse yourself in an evening of soulful melodies and improvisation at the prestigious National Concert Hall.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Feb 1, 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>National Concert Hall, Taipei</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                  <div className="flex-1">
                    <p className="text-sm opacity-80 mb-2">Ticket Types Available</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">VVIP - 150 SUI</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">Grand Tier - 80 SUI</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">Balcony - 35 SUI</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-800">Providing the most professional blockchain ticketing solution</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-800 leading-relaxed">Built on Sui blockchain, ensuring ticket authenticity and immutability</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Easy</h3>
              <p className="text-gray-800 leading-relaxed">One-click login, no complex setup, start using immediately</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent & Public</h3>
              <p className="text-gray-800 leading-relaxed">All transaction records on-chain, transparent and traceable</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
