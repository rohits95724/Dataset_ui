import React from "react";
import { cn } from "@/lib/utils";

const SectionContainerSmall = ({
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
      className={cn("w-full max-w-4xl mb-12 md:mb-14 px-6 md:px-0 mx-auto", className)}
      id={id}
    >
      {children}
    </div>
  );
};

export default SectionContainerSmall;