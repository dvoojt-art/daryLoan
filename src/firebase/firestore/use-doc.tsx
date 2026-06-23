'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentSnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { playNotification } from '@/lib/notification';

export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  const initialLoad = useRef(true);
  const previousData = useRef<string | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          const currentData = {
            ...snapshot.data(),
            id: snapshot.id,
          };

          const currentString = JSON.stringify(currentData);

          // Skip first load
          if (initialLoad.current) {
            initialLoad.current = false;
          } else if (
            previousData.current &&
            previousData.current !== currentString
          ) {
            notification();
          }

          previousData.current = currentString;
          setData(currentData);
        } else {
          setData(null);
        }

        setLoading(false);
      },
      (serverError: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });

        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}