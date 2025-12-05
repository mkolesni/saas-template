'use client'; // Makes this a Client Component

import { ClerkProvider } from '@clerk/nextjs';

interface ClerkWrapperProps {
  children: React.ReactNode;
}

export default function ClerkWrapper({ children }: ClerkWrapperProps) {
  return (
    <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}