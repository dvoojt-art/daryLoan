'use client';

import { useEffect } from 'react';

import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: unknown) => {
  console.log("Received error:", error);

  if (!(error instanceof FirestorePermissionError)) {
    console.error("Not a FirestorePermissionError:", error);
    return;
  }

  toast({
    variant: "destructive",
    title: "Security Rule Denied",
    description: `Operation '${error.context.operation}' was denied at ${error.context.path}. Check your Firestore security rules.`,
  });

  throw error;
};

    const unsubscribe = errorEmitter.subscribe(handlePermissionError);

    return () => {
      unsubscribe();
    };

  }, [toast]);

  return null;
}
