'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DemoFlowPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '1. Login (zkLogin)',
      description: 'User logs in with zkLogin (Google)',
      url: '/login?role=customer',
      button: 'Go to Login',
    },
    {
      title: '2. Homepage',
      description: 'Browse available events',
      url: '/',
      button: 'Go to Homepage',
    },
    {
      title: '3. AI Assistant',
      description: 'AI conversation with buy ticket button',
      url: '/customer/ai/demo',
      button: 'Go to AI Assistant',
    },
    {
      title: '4. Purchase Step 1',
      description: 'Select tickets (Section A x2 pre-selected)',
      url: '/events/demo-taipei-jazz-2026/purchase?ticketType=vvip-prestige&quantity=2',
      button: 'Go to Purchase',
    },
    {
      title: '5. Purchase Step 2',
      description: 'Confirm Order',
      url: '/events/demo-taipei-jazz-2026/purchase?ticketType=vvip-prestige&quantity=2&step=2',
      button: 'Go to Confirm',
    },
    {
      title: '6. Purchase Step 3',
      description: 'Payment (100 SUI)',
      url: '/events/demo-taipei-jazz-2026/purchase?ticketType=vvip-prestige&quantity=2&step=3',
      button: 'Go to Payment',
    },
    {
      title: '7. Purchase Step 4',
      description: 'Success',
      url: '/events/demo-taipei-jazz-2026/purchase?ticketType=vvip-prestige&quantity=2&step=4',
      button: 'Go to Success',
    },
    {
      title: '8. My Tickets List',
      description: 'View purchased tickets',
      url: '/customer/tickets',
      button: 'Go to My Tickets',
    },
    {
      title: '9. Ticket Details',
      description: 'View individual ticket',
      url: '/customer/tickets/demo-ticket-1',
      button: 'Go to Ticket Details',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Demo Flow Guide</h1>
          <p className="text-gray-700 mb-6">
            This page helps you navigate through the complete user flow for screenshots.
            Click on each step to navigate to the corresponding page.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((stepItem, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{stepItem.title}</h3>
                  <p className="text-gray-700 mb-4">{stepItem.description}</p>
                  <div className="flex gap-2">
                    <Link
                      href={stepItem.url}
                      target="_blank"
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
                    >
                      {stepItem.button}
                    </Link>
                    {index < steps.length - 1 && (
                      <button
                        onClick={() => {
                          window.open(stepItem.url, '_blank');
                          setTimeout(() => {
                            const nextStep = steps[index + 1];
                            window.open(nextStep.url, '_blank');
                          }, 1000);
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                      >
                        Open Next Step →
                      </button>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Tips for Screenshots</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Open each step in a new tab to easily switch between pages</li>
            <li>• Use browser zoom (Ctrl/Cmd + 0) to reset zoom for consistent screenshots</li>
            <li>• The AI Assistant demo page has an "Auto Next Step" button to simulate conversation</li>
            <li>• Make sure you're logged in before accessing customer pages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

