'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a real development environment, this could trigger a more detailed overlay.
      // For now, we surface it via toast for visibility.
      toast({
        variant: 'destructive',
        title: 'Security Rule Denied',
        description: `Operation '${error.context.operation}' was denied at ${error.context.path}. Check your Firestore security rules.`,
      });
      
      // We throw the error so it can be caught by Next.js error boundaries or dev overlay
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
