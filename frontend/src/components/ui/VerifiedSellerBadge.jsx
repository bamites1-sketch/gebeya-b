export default function VerifiedSellerBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-bold ${className}`}>
      Verified Seller ✅
    </span>
  );
}
