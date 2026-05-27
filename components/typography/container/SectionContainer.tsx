import React from "react";
import { cn } from "@/lib/utils";

const SectionContainer = ({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  return (
    <div
      className={cn("w-full max-w-7xl mb-12 md:mb-14 mx-auto px-6 md:px-0", className)}
      id={id}
    >
      {children}
    </div>
  );
};

export default SectionContainer;