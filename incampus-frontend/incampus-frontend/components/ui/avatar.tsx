import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  online,
  className,
}: {
  src?: string;
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover border border-border"
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-primary/20 text-primary font-display font-semibold border border-border"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg",
            online ? "bg-success" : "bg-ink-faint"
          )}
        />
      )}
    </div>
  );
}
