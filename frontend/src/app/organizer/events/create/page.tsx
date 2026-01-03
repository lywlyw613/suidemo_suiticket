'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMintTicket } from '@/hooks/useMintTicket';
import { DEMO_TICKET_ADMIN_ID, isDemoMode } from '@/lib/demoData';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createTicketType, publishTicketType } from '@/lib/suiMove';
import { TransactionBlock } from '@mysten/sui.js/transactions';

type EventData = {
  name: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  saleStartTime: string;
  saleEndTime: string;
  venueName: string;
  venueAddress: string;
  venueLat?: number;
  venueLng?: number;
  hasSeating: boolean;
  seatingConfig?: {
    rows: number;
    seatsPerRow: number;
    reservedSeats: string[];
  };
  maxTicketsPerBuyer?: number;
  heroImageUrl?: string;
  heroImageBlobId?: string;
  galleryUrls: string[];
  galleryBlobIds: string[];
  seatMapUrl?: string;
  seatMapBlobId?: string;
};

type TicketTypeData = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  seatingZone?: string;
  reservedSeats?: string[];
  isListed: boolean;
};

export default function CreateEventPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    description: '',
    category: '',
    startTime: '',
    endTime: '',
    saleStartTime: '',
    saleEndTime: '',
    venueName: '',
    venueAddress: '',
    hasSeating: false,
    maxTicketsPerBuyer: undefined,
    galleryUrls: [],
    galleryBlobIds: [],
  });

  const [ticketTypes, setTicketTypes] = useState<TicketTypeData[]>([]);

  // Demo 模式：純前端創建活動
  const handleStep1Submit = async () => {
    if (!eventData.name || !eventData.startTime || !eventData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Demo 模式：直接生成 event ID，不調用後端
      const demoEventId = `demo-event-${Date.now()}`;
      setEventId(demoEventId);
      setStep(2);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Demo 模式：純前端保存票種配置
  const handleStep2Submit = async () => {
    if (ticketTypes.length === 0) {
      alert('Please add at least one ticket type');
      return;
    }

    setLoading(true);
    try {
      // Demo 模式：直接保存到本地狀態，不調用後端
      // 實際部署時，這裡會調用 Move 合約的 mint_ticket 函數
      console.log('Ticket types configured:', ticketTypes);
      setStep(3);
    } catch (error: any) {
      console.error('Failed to create ticket types:', error);
      alert('Failed to create ticket types');
    } finally {
      setLoading(false);
    }
  };

  // Demo 模式：圖片上傳（使用本地 URL 或 Walrus）
  const handleImageUpload = async (file: File, type: 'hero' | 'gallery' | 'seatMap') => {
    try {
      // Demo 模式：使用本地 URL（實際部署時使用 Walrus）
      const imageUrl = URL.createObjectURL(file);
      const blobId = `demo-blob-${Date.now()}`;
      
      if (type === 'hero') {
        setEventData({ ...eventData, heroImageUrl: imageUrl, heroImageBlobId: blobId });
      } else if (type === 'gallery') {
        setEventData({
          ...eventData,
          galleryUrls: [...eventData.galleryUrls, imageUrl],
          galleryBlobIds: [...eventData.galleryBlobIds, blobId],
        });
      } else if (type === 'seatMap') {
        setEventData({ ...eventData, seatMapUrl: imageUrl, seatMapBlobId: blobId });
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    }
  };

  const handleStep3Submit = () => {
    if (!eventData.heroImageUrl) {
      alert('Please upload a hero image (poster)');
      return;
    }
    setStep(4);
  };

  // Step 4: Preview & Publish - 創建 Move 合約中的票券類型並發布
  const handlePublish = async () => {
    if (!eventId || !currentAccount?.address) {
      alert('Please connect wallet first');
      return;
    }

    setLoading(true);
    try {
      const ticketTypeIds: string[] = [];
      
      // 為每個要發布的票種創建 Move 合約中的 TicketType
      for (const ticketType of ticketTypes) {
        if (ticketType.isListed) {
          // 創建票券類型
          const createResult = await createTicketType(
            DEMO_TICKET_ADMIN_ID,
            {
              eventId: eventId,
              ticketTypeName: ticketType.name,
              price: ticketType.price,
              totalQuantity: ticketType.quantity,
              organizerId: currentAccount.address,
            },
            async (tx: TransactionBlock) => {
              return new Promise((resolve, reject) => {
                signAndExecuteTransaction(
                  { transaction: tx as any },
                  {
                    onSuccess: (result) => resolve(result),
                    onError: (error: any) => {
                      // 確保錯誤對象可以被正確處理
                      const errorMessage = error?.message || error?.toString() || 'Transaction failed';
                      reject(new Error(errorMessage));
                    },
                  }
                );
              });
            }
          );

          if (createResult.success && createResult.ticketTypeId) {
            ticketTypeIds.push(createResult.ticketTypeId);
            
            // 發布票券類型（設置為可銷售）
            await publishTicketType(
              createResult.ticketTypeId,
              async (tx: TransactionBlock) => {
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
          } else {
            throw new Error(createResult.error || 'Failed to create ticket type');
          }
        }
      }

      // 保存到 localStorage，包含 ticketTypeIds
      const eventDataToSave = {
        id: eventId,
        ...eventData,
        ticketTypes: ticketTypes.map((t, index) => {
          const listedIndex = ticketTypes.filter(tt => tt.isListed).findIndex(tt => tt === t);
          return {
            ...t,
            ticketTypeId: t.isListed && ticketTypeIds[listedIndex] ? ticketTypeIds[listedIndex] : undefined,
          };
        }),
        status: 'published',
        organizerId: currentAccount.address,
        createdAt: new Date().toISOString(),
      };
      
      const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
      const existingIndex = savedEvents.findIndex((e: any) => e.id === eventId);
      if (existingIndex >= 0) {
        savedEvents[existingIndex] = eventDataToSave;
      } else {
        savedEvents.push(eventDataToSave);
      }
      localStorage.setItem('demo_events', JSON.stringify(savedEvents));
      
      alert(`Event published successfully! Created ${ticketTypeIds.length} ticket types on-chain.`);
      router.push('/organizer/dashboard');
    } catch (error: any) {
      console.error('Failed to publish event:', error);
      // 安全地提取錯誤訊息
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }
      alert(`Failed to publish event: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      // Demo 模式：保存到 localStorage
      const eventDataToSave = {
        id: eventId,
        ...eventData,
        ticketTypes,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
      const existingIndex = savedEvents.findIndex((e: any) => e.id === eventId);
      if (existingIndex >= 0) {
        savedEvents[existingIndex] = eventDataToSave;
      } else {
        savedEvents.push(eventDataToSave);
      }
      localStorage.setItem('demo_events', JSON.stringify(savedEvents));
      
      router.push('/organizer/dashboard');
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/organizer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
            SuiTicket
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-800 font-medium">Step {step} of 4</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-secondary-600' : 'bg-gray-200'}`} />
                {s < 4 && <div className={`w-2 h-2 rounded-full ${s < step ? 'bg-secondary-600' : 'bg-gray-200'} -ml-1`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-800 font-medium">
            <span>Basic Info</span>
            <span>Ticketing</span>
            <span>Images</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && <Step1BasicInfo eventData={eventData} setEventData={setEventData} onSubmit={handleStep1Submit} loading={loading} />}
        {step === 2 && <Step2Ticketing eventData={eventData} setEventData={setEventData} ticketTypes={ticketTypes} setTicketTypes={setTicketTypes} onSubmit={handleStep2Submit} loading={loading} />}
        {step === 3 && <Step3Images eventData={eventData} setEventData={setEventData} onImageUpload={handleImageUpload} onSubmit={handleStep3Submit} />}
        {step === 4 && <Step4Preview eventData={eventData} ticketTypes={ticketTypes} onPublish={handlePublish} onSaveDraft={handleSaveDraft} loading={loading} />}
      </main>
    </div>
  );
}

// Step 1: Basic Information
function Step1BasicInfo({ eventData, setEventData, onSubmit, loading }: any) {
  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Information</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={eventData.name}
            onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
            className="input w-full"
            placeholder="Enter event name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category
          </label>
          <select
            value={eventData.category}
            onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
            className="input w-full"
          >
            <option value="">Select category</option>
            <option value="concert">Concert</option>
            <option value="sports">Sports</option>
            <option value="theater">Theater</option>
            <option value="conference">Conference</option>
            <option value="festival">Festival</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            value={eventData.description}
            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            className="input w-full h-32"
            placeholder="Describe your event"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={eventData.startTime}
              onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={eventData.endTime}
              onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Sale Start Time
            </label>
            <input
              type="datetime-local"
              value={eventData.saleStartTime}
              onChange={(e) => setEventData({ ...eventData, saleStartTime: e.target.value })}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Sale End Time
            </label>
            <input
              type="datetime-local"
              value={eventData.saleEndTime}
              onChange={(e) => setEventData({ ...eventData, saleEndTime: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Venue Name
          </label>
          <input
            type="text"
            value={eventData.venueName}
            onChange={(e) => setEventData({ ...eventData, venueName: e.target.value })}
            className="input w-full"
            placeholder="Enter venue name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Venue Address
          </label>
          <input
            type="text"
            value={eventData.venueAddress}
            onChange={(e) => setEventData({ ...eventData, venueAddress: e.target.value })}
            className="input w-full"
            placeholder="Enter venue address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Maximum Tickets Per Buyer
          </label>
          <input
            type="number"
            value={eventData.maxTicketsPerBuyer || ''}
            onChange={(e) => setEventData({ ...eventData, maxTicketsPerBuyer: e.target.value ? Number(e.target.value) : undefined })}
            className="input w-full"
            placeholder="No limit if empty"
            min="1"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onSubmit} disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Next: Ticketing Setup'}
        </button>
      </div>
    </div>
  );
}

// Step 2: Ticketing Setup (with seating management)
function Step2Ticketing({ eventData, setEventData, ticketTypes, setTicketTypes, onSubmit, loading }: any) {
  const [hasSeating, setHasSeating] = useState(eventData.hasSeating);
  const [seatingRows, setSeatingRows] = useState(eventData.seatingConfig?.rows || 10);
  const [seatsPerRow, setSeatsPerRow] = useState(eventData.seatingConfig?.seatsPerRow || 20);

  const handleToggleSeating = (value: boolean) => {
    setHasSeating(value);
    setEventData({
      ...eventData,
      hasSeating: value,
      seatingConfig: value ? {
        rows: seatingRows,
        seatsPerRow: seatsPerRow,
        reservedSeats: eventData.seatingConfig?.reservedSeats || [],
      } : undefined,
    });
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        seatingZone: '',
        reservedSeats: [],
        isListed: true,
      },
    ]);
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Ticketing Setup</h2>

      {/* Seating Configuration */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={hasSeating}
            onChange={(e) => handleToggleSeating(e.target.checked)}
            className="w-5 h-5 text-secondary-600"
          />
          <span className="text-lg font-semibold text-gray-900">Enable Assigned Seating</span>
        </label>

        {hasSeating && (
          <div className="mt-4 space-y-4 pl-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Number of Rows
                </label>
                <input
                  type="number"
                  value={seatingRows}
                  onChange={(e) => {
                    const rows = Number(e.target.value);
                    setSeatingRows(rows);
                    setEventData({
                      ...eventData,
                      seatingConfig: {
                        ...eventData.seatingConfig!,
                        rows,
                      },
                    });
                  }}
                  className="input w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Seats Per Row
                </label>
                <input
                  type="number"
                  value={seatsPerRow}
                  onChange={(e) => {
                    const seats = Number(e.target.value);
                    setSeatsPerRow(seats);
                    setEventData({
                      ...eventData,
                      seatingConfig: {
                        ...eventData.seatingConfig!,
                        seatsPerRow: seats,
                      },
                    });
                  }}
                  className="input w-full"
                  min="1"
                />
              </div>
            </div>
            <p className="text-sm text-gray-800">
              Total seats: {seatingRows * seatsPerRow} (Rectangular venue like cinema)
            </p>
          </div>
        )}
      </div>

      {/* Ticket Types */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Ticket Types (Tiered Pricing)</h3>
          <button onClick={addTicketType} className="btn-primary text-sm">
            + Add Ticket Type
          </button>
        </div>

        {ticketTypes.map((ticketType: any, index: number) => (
          <div key={index} className="card p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Ticket Type {index + 1}</h4>
              <button
                onClick={() => removeTicketType(index)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ticketType.name}
                  onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                  className="input w-full"
                  placeholder="e.g., VIP, Zone A, Standard"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Seating Zone
                </label>
                <input
                  type="text"
                  value={ticketType.seatingZone || ''}
                  onChange={(e) => updateTicketType(index, 'seatingZone', e.target.value)}
                  className="input w-full"
                  placeholder="e.g., VIP, Zone A, Balcony"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={ticketType.description}
                onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                className="input w-full h-20"
                placeholder="Describe this ticket type"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Price (SUI) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={ticketType.price}
                  onChange={(e) => updateTicketType(index, 'price', Number(e.target.value))}
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={ticketType.quantity}
                  onChange={(e) => updateTicketType(index, 'quantity', Number(e.target.value))}
                  className="input w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={ticketType.isListed}
                    onChange={(e) => updateTicketType(index, 'isListed', e.target.checked)}
                    className="w-4 h-4 text-secondary-600"
                  />
                  <span className="text-sm text-gray-900">List for sale</span>
                </label>
              </div>
            </div>
          </div>
        ))}

        {ticketTypes.length === 0 && (
          <div className="text-center py-8 text-gray-900">
            No ticket types added yet. Click "Add Ticket Type" to get started.
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => window.history.back()} className="btn-secondary">
          Back
        </button>
        <button onClick={onSubmit} disabled={loading || ticketTypes.length === 0} className="btn-primary">
          {loading ? 'Saving...' : 'Next: Image Upload'}
        </button>
      </div>
    </div>
  );
}

// Step 3: Image Upload
function Step3Images({ eventData, setEventData, onImageUpload, onSubmit }: any) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileSelect = async (file: File, type: 'hero' | 'gallery' | 'seatMap') => {
    if (type === 'gallery' && eventData.galleryUrls.length >= 5) {
      alert('Maximum 5 gallery images allowed');
      return;
    }

    setUploading(type);
    try {
      await onImageUpload(file, type);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Image Upload</h2>

      <div className="space-y-8">
        {/* Hero Image (Required) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Event Poster <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            {eventData.heroImageUrl ? (
              <div>
                <img src={eventData.heroImageUrl} alt="Hero" className="max-w-full h-64 mx-auto rounded-lg mb-4" />
                <p className="text-sm text-green-600 mb-2">✓ Image uploaded successfully</p>
                <label className="btn-secondary inline-block cursor-pointer">
                  Replace Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, 'hero');
                    }}
                    className="hidden"
                    disabled={uploading === 'hero'}
                  />
                </label>
              </div>
            ) : (
              <div>
                <label className="btn-secondary inline-block cursor-pointer">
                  {uploading === 'hero' ? 'Uploading...' : 'Upload Poster'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, 'hero');
                    }}
                    className="hidden"
                    disabled={uploading === 'hero'}
                  />
                </label>
                <p className="text-sm text-gray-900 mt-2">Required: Main event poster</p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Images (Optional, max 5) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Gallery Images (Optional, max 5)
          </label>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {eventData.galleryUrls.map((url: string, index: number) => (
              <div key={index} className="relative">
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    const newUrls = eventData.galleryUrls.filter((_: string, i: number) => i !== index);
                    const newBlobIds = eventData.galleryBlobIds.filter((_: string, i: number) => i !== index);
                    setEventData({ ...eventData, galleryUrls: newUrls, galleryBlobIds: newBlobIds });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            {eventData.galleryUrls.length < 5 && (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-secondary-400 flex items-center justify-center min-h-[8rem]">
                <span className="text-3xl text-gray-800 font-semibold">{uploading === 'gallery' ? 'Uploading...' : '+'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, 'gallery');
                  }}
                  className="hidden"
                  disabled={uploading === 'gallery'}
                />
              </label>
            )}
          </div>
        </div>

        {/* Seating Chart (Optional, if hasSeating) */}
        {eventData.hasSeating && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Seating Chart (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              {eventData.seatMapUrl ? (
                <div>
                  <img src={eventData.seatMapUrl} alt="Seat Map" className="max-w-full h-64 mx-auto rounded-lg mb-4" />
                  <label className="btn-secondary inline-block cursor-pointer">
                    Replace Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file, 'seatMap');
                      }}
                      className="hidden"
                      disabled={uploading === 'seatMap'}
                    />
                  </label>
                </div>
              ) : (
                <label className="btn-secondary inline-block cursor-pointer">
                  {uploading === 'seatMap' ? 'Uploading...' : 'Upload Seating Chart'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, 'seatMap');
                    }}
                    className="hidden"
                    disabled={uploading === 'seatMap'}
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => window.history.back()} className="btn-secondary">
          Back
        </button>
        <button onClick={onSubmit} disabled={!eventData.heroImageUrl} className="btn-primary">
          Next: Preview & Publish
        </button>
      </div>
    </div>
  );
}

// Step 4: Preview & Publish
function Step4Preview({ eventData, ticketTypes, onPublish, onSaveDraft, loading }: any) {
  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Preview & Publish</h2>

      <div className="space-y-6">
        {/* Event Preview */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h3>
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <div className="text-gray-900">
              <span className="font-semibold text-gray-800">Name:</span> <span className="text-gray-900">{eventData.name}</span>
            </div>
            <div className="text-gray-900">
              <span className="font-semibold text-gray-800">Category:</span> <span className="text-gray-900">{eventData.category || 'N/A'}</span>
            </div>
            <div className="text-gray-900">
              <span className="font-semibold text-gray-800">Start Time:</span> <span className="text-gray-900">{new Date(eventData.startTime).toLocaleString()}</span>
            </div>
            <div className="text-gray-900">
              <span className="font-semibold text-gray-800">Venue:</span> <span className="text-gray-900">{eventData.venueName || 'N/A'}</span>
            </div>
            <div className="text-gray-900">
              <span className="font-semibold text-gray-800">Has Seating:</span> <span className="text-gray-900">{eventData.hasSeating ? 'Yes' : 'No'}</span>
            </div>
            {eventData.hasSeating && eventData.seatingConfig && (
              <div className="text-gray-900">
                <span className="font-semibold text-gray-800">Seating:</span> <span className="text-gray-900">{eventData.seatingConfig.rows} rows × {eventData.seatingConfig.seatsPerRow} seats = {eventData.seatingConfig.rows * eventData.seatingConfig.seatsPerRow} total seats</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Types Preview */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ticket Types</h3>
          <div className="space-y-3">
            {ticketTypes.map((tt: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{tt.name}</div>
                    <div className="text-sm text-gray-800">{tt.seatingZone || 'General'}</div>
                    <div className="text-sm text-gray-900">Price: {tt.price} SUI | Quantity: {tt.quantity}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tt.isListed ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {tt.isListed ? 'Listed' : 'Not Listed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images Preview */}
        {eventData.heroImageUrl && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Poster</h3>
            <img src={eventData.heroImageUrl} alt="Poster" className="w-full max-w-md rounded-lg" />
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => window.history.back()} className="btn-secondary">
          Back
        </button>
        <div className="flex gap-4">
          <button onClick={onSaveDraft} disabled={loading} className="btn-secondary">
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={onPublish} disabled={loading} className="btn-primary">
            {loading ? 'Publishing...' : 'Publish Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

