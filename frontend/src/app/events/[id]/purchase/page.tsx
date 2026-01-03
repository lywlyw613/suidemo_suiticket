'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { mintTicket } from '@/lib/suiMove';
import { DEMO_TICKET_ADMIN_ID } from '@/lib/demoData';
import { getDemoEvent } from '@/lib/demoEvents';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const suiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

export default function PurchasePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const ticketTypeId = searchParams.get('ticketType');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mintedTickets, setMintedTickets] = useState<string[]>([]);
  const [transactionDigest, setTransactionDigest] = useState<string | null>(null);

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
        if (ticketTypeId) {
          const ticketType = foundEvent.ticketTypes?.find((t: any) => t.id === ticketTypeId);
          if (ticketType) {
            setSelectedTicketType(ticketType);
          }
        }
      }
    } else {
      setEvent(eventData);
      if (ticketTypeId) {
        const ticketType = eventData.ticketTypes.find((t: any) => t.id === ticketTypeId);
        if (ticketType) {
          setSelectedTicketType(ticketType);
        }
      }
    }
  }, [mounted, eventId, ticketTypeId]);

  if (!mounted) {
    return null;
  }

  if (!event || !selectedTicketType) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 mb-4">Event or ticket type not found</p>
          <Link href="/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = selectedTicketType.price * quantity;

  const handlePurchase = async () => {
    if (!currentAccount?.address) {
      setError('Please connect wallet first');
      return;
    }

    setPurchasing(true);
    setError(null);
    setSuccess(false);

    try {
      const mintedTicketIds: string[] = [];
      let lastDigest: string | null = null;

      // Mint tickets one by one
      for (let i = 0; i < quantity; i++) {
        const ticketNumber = `${selectedTicketType.id}-${Date.now()}-${i}`;
        
        const result = await mintTicket(
          DEMO_TICKET_ADMIN_ID,
          {
            eventId: event.id,
            ticketType: selectedTicketType.name,
            ticketNumber,
            seatZone: selectedTicketType.seatRange ? selectedTicketType.seatRange.split(' ')[0] : undefined,
            seatNumber: selectedTicketType.seatRange ? `${i + 1}` : undefined,
            purchasePrice: selectedTicketType.price,
            organizerId: event.organizerId || currentAccount.address,
            eventName: event.name,
            eventStartTime: new Date(event.startTime).getTime(),
            venueName: event.venueName,
            recipient: currentAccount.address,
          },
          async (tx: TransactionBlock) => {
            // Add payment: split coins from gas and transfer to organizer
            const priceMist = BigInt(Math.floor(selectedTicketType.price * 1_000_000_000));
            const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(priceMist)]);
            
            // Transfer payment to organizer (or keep in contract for demo)
            // For demo, we'll just transfer to a demo address
            const organizerAddress = event.organizerId || '0x0000000000000000000000000000000000000000000000000000000000000000';
            tx.transferObjects([payment], organizerAddress);

            return new Promise((resolve, reject) => {
              signAndExecuteTransaction(
                { transaction: tx as any },
                {
                  onSuccess: (result) => resolve(result),
                  onError: (error) => reject(error),
                }
              );
            });
          }
        );

        if (result.success) {
          if (result.ticketId) {
            mintedTicketIds.push(result.ticketId);
          }
          lastDigest = result.digest || null;
        } else {
          throw new Error(result.error || 'Failed to mint ticket');
        }
      }

      setMintedTickets(mintedTicketIds);
      setTransactionDigest(lastDigest);
      setSuccess(true);
      
      // Save tickets to localStorage for demo
      const userTickets = JSON.parse(localStorage.getItem('user_tickets') || '[]');
      mintedTicketIds.forEach(ticketId => {
        userTickets.push({
          ticketId,
          eventId: event.id,
          eventName: event.name,
          ticketType: selectedTicketType.name,
          purchaseTime: Date.now(),
          purchasePrice: selectedTicketType.price,
        });
      });
      localStorage.setItem('user_tickets', JSON.stringify(userTickets));
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to purchase tickets');
    } finally {
      setPurchasing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              NFT Ticketing System
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Successful!</h1>
            <p className="text-gray-700">Your NFT tickets have been minted on Sui Devnet</p>
          </div>

          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700 mb-1">Event</p>
                <p className="font-semibold text-gray-900">{event.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Ticket Type</p>
                <p className="font-semibold text-gray-900">{selectedTicketType.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Quantity</p>
                <p className="font-semibold text-gray-900">{quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">Total Price</p>
                <p className="font-semibold text-gray-900">{totalPrice} SUI</p>
              </div>
              {transactionDigest && (
                <div>
                  <p className="text-sm text-gray-700 mb-1">Transaction Digest</p>
                  <p className="font-mono text-xs text-gray-800 break-all">{transactionDigest}</p>
                  <a
                    href={`https://suiexplorer.com/txblock/${transactionDigest}?network=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm mt-1 inline-block"
                  >
                    View on Sui Explorer →
                  </a>
                </div>
              )}
            </div>
          </div>

          {mintedTickets.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Minted Tickets</h2>
              <div className="space-y-2">
                {mintedTickets.map((ticketId, index) => (
                  <div key={ticketId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Ticket #{index + 1}</span>
                    <Link
                      href={`/customer/tickets/${ticketId}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Link href="/customer/tickets" className="flex-1 btn-primary text-center">
              View My Tickets
            </Link>
            <Link href="/events" className="flex-1 btn-secondary text-center">
              Browse More Events
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NFT Ticketing System
          </Link>
          <Link href={`/events/${eventId}`} className="text-gray-700 hover:text-gray-900 font-medium">
            ← Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Tickets</h1>
          <p className="text-gray-700">{event.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Ticket Type</span>
                  <span className="font-semibold text-gray-900">{selectedTicketType.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Quantity</span>
                  <span className="font-semibold text-gray-900">{quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Price per ticket</span>
                  <span className="font-semibold text-gray-900">{selectedTicketType.price} SUI</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">{totalPrice} SUI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 border-2 border-primary-500 rounded-xl bg-primary-50">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Sui Wallet</p>
                    <p className="text-sm text-gray-700">
                      {currentAccount?.address 
                        ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Purchase</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="mb-6 space-y-2 text-sm text-gray-700">
                <p>• Tickets will be minted as NFTs on Sui Devnet</p>
                <p>• Payment will be processed via Sui Wallet</p>
                <p>• Transaction fee (gas) will be deducted from your wallet</p>
              </div>

              <button
                onClick={handlePurchase}
                disabled={!currentAccount || purchasing}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Processing...' : !currentAccount ? 'Connect Wallet' : `Pay ${totalPrice} SUI`}
              </button>

              {!currentAccount && (
                <p className="text-sm text-gray-600 text-center mt-4">
                  Please connect your wallet to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

