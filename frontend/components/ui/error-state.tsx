import { WifiOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Couldn't load this",
  description = "Something went wrong on our end. Give it another try.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("glass flex flex-col items-center rounded-2xl p-10 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <WifiOff size={20} />
      </div>
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw size={14} className="mr-1.5" /> Try again
        </Button>
      )}
    </div>
  );
}
