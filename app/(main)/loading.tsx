import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col space-y-2">
      <Skeleton className="h-[20px] w-2/5 rounded-xl" />
      <Skeleton className="h-[10px] w-2/5 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-[200px]" />
      </div>
    </div>
  );
}
