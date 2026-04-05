import { AnimatedBackground } from "@/app/components/layout/animated-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AnimatedBackground>{children}</AnimatedBackground>;
}
