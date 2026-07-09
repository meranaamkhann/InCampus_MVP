import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold">
          <GraduationCap className="text-primary" size={22} />
          InCampus
        </Link>
        <div className="glass rounded-2xl p-8 shadow-glass">{children}</div>
      </div>
    </div>
  );
}
