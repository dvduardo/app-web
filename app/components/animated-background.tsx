"use client";

export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Decorative orbs */}
      <div className="absolute top-10 left-10 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation"></div>
      <div className="absolute -bottom-8 right-10 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation animation-delay-2s"></div>
      <div className="absolute top-1/2 left-1/3 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation animation-delay-4s"></div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
