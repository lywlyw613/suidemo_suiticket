'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getDemoEvent } from '@/lib/demoEvents';

export default function ManageEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !eventId) return;
    
    // Load event data
    const eventData = getDemoEvent(eventId);
    if (!eventData) {
      // Try loading from localStorage
      const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
      const foundEvent = savedEvents.find((e: any) => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setTicketTypes(foundEvent.ticketTypes || []);
      }
    } else {
      setEvent(eventData);
      setTicketTypes(eventData.ticketTypes || []);
    }
  }, [mounted, eventId]);

  if (!mounted) {
    return null;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 mb-4">Event not found</p>
          <Link href="/organizer/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const toggleListing = (index: number) => {
    const updated = [...ticketTypes];
    updated[index] = {
      ...updated[index],
      isListed: !updated[index].isListed,
    };
    setTicketTypes(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
      const eventIndex = savedEvents.findIndex((e: any) => e.id === eventId);
      
      if (eventIndex >= 0) {
        // 更新票券類型的 isListed 狀態
        savedEvents[eventIndex] = {
          ...savedEvents[eventIndex],
          ticketTypes: ticketTypes.map(t => ({
            ...t,
            // 保持 ticketTypeId 不變
            ticketTypeId: savedEvents[eventIndex].ticketTypes?.find((tt: any) => tt.id === t.id)?.ticketTypeId,
          })),
        };
      } else {
        savedEvents.push({
          ...event,
          ticketTypes,
        });
      }
      
      localStorage.setItem('demo_events', JSON.stringify(savedEvents));
      alert('Listing settings saved successfully!');
      router.push('/organizer/dashboard');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save listing settings');
    } finally {
      setSaving(false);
    }
  };

  const totalListed = ticketTypes.filter(t => t.isListed).length;
  const totalTickets = ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
  const listedTickets = ticketTypes.filter(t => t.isListed).reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/organizer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
          <Link href="/organizer/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
            ← Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Ticket Listings</h1>
          <p className="text-gray-700">{event.name}</p>
        </div>

        {/* Summary */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Listing Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{totalListed}</p>
              <p className="text-sm text-gray-700">Listed Types</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">{listedTickets}</p>
              <p className="text-sm text-gray-700">Listed Tickets</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{totalTickets - listedTickets}</p>
              <p className="text-sm text-gray-700">Reserved</p>
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ticket Types</h2>
          <div className="space-y-4">
            {ticketTypes.map((ticketType, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 transition-all ${
                  ticketType.isListed
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{ticketType.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ticketType.isListed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticketType.isListed ? 'Listed' : 'Not Listed'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{ticketType.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-700">
                        <span className="font-semibold">Price:</span> {ticketType.price} SUI
                      </span>
                      <span className="text-gray-700">
                        <span className="font-semibold">Quantity:</span> {ticketType.quantity}
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className={`text-sm font-semibold ${
                      ticketType.isListed ? 'text-primary-600' : 'text-gray-600'
                    }`}>
                      {ticketType.isListed ? 'Public' : 'Private'}
                    </span>
                    <div className={`relative w-14 h-8 rounded-full transition-colors ${
                      ticketType.isListed ? 'bg-primary-500' : 'bg-gray-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={ticketType.isListed}
                        onChange={() => toggleListing(index)}
                        className="sr-only"
                      />
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        ticketType.isListed ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Listing Settings'}
          </button>
          <Link href="/organizer/dashboard" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </main>
    </div>
  );
}

