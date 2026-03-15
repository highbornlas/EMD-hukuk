import { SkeletonTable } from '@/components/ui/SkeletonTable';

export default function TakvimLoading() {
  return (
    <div className="p-6">
      <h1 className="font-[var(--font-playfair)] text-2xl text-text font-bold mb-6">Takvim</h1>
      <SkeletonTable rows={8} cols={7} />
    </div>
  );
}
