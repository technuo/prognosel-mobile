"use client";

import React from "react";

interface MobileWrapperProps {
  children: React.ReactNode;
}

export default function MobileWrapper({ children }: MobileWrapperProps) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-[#e8e6e0]">
      {/* Responsive: mobile full-width → sm 430px → md 640px → lg 1024px → xl 1280px */}
      <div className="w-full sm:max-w-[430px] md:max-w-[640px] lg:max-w-[1024px] xl:max-w-[1280px] min-h-screen bg-paper shadow-2xl relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
