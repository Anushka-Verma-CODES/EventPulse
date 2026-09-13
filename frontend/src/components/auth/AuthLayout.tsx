import { ReactNode } from "react";
import AuthIllustration from "./AuthIllustration";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-[#FCFCFD] lg:grid-cols-2">
      <AuthIllustration />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
