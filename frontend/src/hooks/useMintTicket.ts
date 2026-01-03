// Hook for minting tickets using Move contract
'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { mintTicket, createGateCap } from '@/lib/suiMove';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export function useMintTicket() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mint = async (
    adminId: string,
    params: {
      eventId: string;
      ticketType: string;
      ticketNumber: string;
      seatZone?: string;
      seatNumber?: string;
      purchasePrice: number;
      organizerId: string;
      eventName: string;
      eventStartTime: number;
      venueName: string;
      recipient: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mintTicket(
        adminId,
        params,
        async (tx: TransactionBlock) => {
          return new Promise((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction: tx },
              {
                onSuccess: (result) => resolve(result),
                onError: (error) => reject(error),
              }
            );
          });
        }
      );

      if (result.success) {
        setLoading(false);
        return result;
      } else {
        throw new Error(result.error || 'Failed to mint ticket');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mint ticket');
      setLoading(false);
      return {
        success: false,
        error: err.message || 'Failed to mint ticket',
      };
    }
  };

  const createCap = async (
    adminId: string,
    eventId: string,
    recipient: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createGateCap(
        adminId,
        eventId,
        recipient,
        async (tx: TransactionBlock) => {
          return new Promise((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction: tx },
              {
                onSuccess: (result) => resolve(result),
                onError: (error) => reject(error),
              }
            );
          });
        }
      );

      if (result.success) {
        setLoading(false);
        return result;
      } else {
        throw new Error(result.error || 'Failed to create gate cap');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create gate cap');
      setLoading(false);
      return {
        success: false,
        error: err.message || 'Failed to create gate cap',
      };
    }
  };

  return {
    mint,
    createCap,
    loading,
    error,
  };
}

