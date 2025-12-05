import dynamic from 'next/dynamic';

const PricingTable = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.PricingTable })),
  { ssr: false } // Skips server prerender — loads only on client
);

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Subscription Plans</h1>
      <PricingTable />
    </div>
  );
}