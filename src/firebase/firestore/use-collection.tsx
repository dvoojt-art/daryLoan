'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

import { FirestorePermissionError } from '../errors';
import { playNotification } from '../../lib/notification';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  const initialLoad = useRef(true);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // ✅ First load: mark everything as already seen
        if (initialLoad.current) {
          docs.forEach((doc: any) => {
            seenIds.current.add(doc.id);
          });

          initialLoad.current = false;
        } 
        // 🔔 After first load: detect new docs only
        else {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const id = change.doc.id;

              // Only trigger if truly new
              if (!seenIds.current.has(id)) {
                seenIds.current.add(id);
                playNotification();
              }
            }
          });
        }

        setData(docs);
        setLoading(false);
      },

      (serverError: FirestoreError) => {
        console.error('Firestore error:', serverError);

        const permissionError = new FirestorePermissionError({
          path: (query as any)?.path || 'unknown-collection',
          operation: 'list',
        });

        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}