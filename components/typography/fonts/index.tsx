import { cn } from "@/lib/utils";
import React from "react";

// Define the available font weights for type safety
type FontWeight = "regular" | "medium" | "semibold" | "bold";

// Create a mapping from our weight prop to Tailwind CSS classes
const fontWeightClasses: Record<FontWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

// Define the props for our new polymorphic component
type TypographyProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType; // React.ElementType is the key here!
  weight?: FontWeight;
};

type HeadingTypographyProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType; // React.ElementType is the key here!
  weight?: FontWeight;
};

export const HeadingXLarge2 = ({
  children,
  className,
  as: Component = "h1", // Set the default tag to 'h1'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[1.875rem]/[2.25rem] md:text-[2.25rem]/[3rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const HeadingLarge2 = ({
  children,
  className,
  as: Component = "h2", // Set the default tag to 'h2'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component className={cn("  md:text-[1.75rem]/[2rem] ", fontWeightClasses[weight], className)}>{children}</Component>
  );
};

export const DisplayXLarge = ({
  children,
  className,
  as: Component = "h1", // Set the default tag to 'h1'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[2.5rem]/[3rem] md:text-[4.5rem]/[4.875rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const DisplayLarge = ({
  children,
  className,
  as: Component = "h1", // Set the default tag to 'h1'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[2.375rem]/[2.875rem] md:text-[4rem]/[4.375rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const DisplayMedium = ({
  children,
  className,
  as: Component = "h1", // Set the default tag to 'h1'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[2.25rem]/[2.625rem] md:text-[3.5rem]/[4rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const DisplaySmall = ({
  children,
  className,
  as: Component = "h1", // Set the default tag to 'h1'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[2.125rem]/[2.5rem] md:text-[3rem]/[3.5rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const Heading2XLarge = ({
  children,
  className,
  as: Component = "h1", // Set the default tag to 'h1'
  weight = "bold",
}: HeadingTypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[2rem]/[2.375rem] md:text-[2.5rem]/[2.875rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const HeadingXLarge = ({
  children,
  className,
  as: Component = "h2", // Set the default tag to 'h2'
  weight = "semibold",
}: HeadingTypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[1.25rem]/[1.75rem] md:text-[2.25rem]/[2.625rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const HeadingLarge = ({
  children,
  className,
  as: Component = "h2", // Set the default tag to 'h1'
  weight = "semibold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[1.25rem]/[1.625rem] md:text-[1.5rem]/[2rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const HeadingMedium = ({
  children,
  className,
  as: Component = "h3", // Set the default tag to 'h1'
  weight = "semibold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[1.25rem]/[1.625rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const HeadingSmall = ({
  children,
  className,
  as: Component = "h4", // Set the default tag to 'h1'
  weight = "bold",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[1rem]/[1.5rem] md:text-[1.125rem]/[1.5rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const BodyLarge = ({
  children,
  className,
  as: Component = "p", // Set the default tag to 'h1'
  weight = "regular",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-sm/[1.125rem] md:text-[1rem]/[1.5rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const BodyMedium = ({
  children,
  className,
  as: Component = "p", // Set the default tag to 'h1'
  weight = "regular",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-sm/[1.125rem] md:text-[0.875rem]/[1.25rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const BodySmall = ({
  children,
  className,
  as: Component = "p", // Set the default tag to 'h1'
  weight = "regular",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[0.625rem]/[0.875rem] md:text-[0.75rem]/[1.125rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const BodyXSmall = ({
  children,
  className,
  as: Component = "p", // Set the default tag to 'h1'
  weight = "regular",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[0.625rem]/[0.875rem] md:text-[0.625rem]/[0.875rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};

export const CaptionMedium = ({
  children,
  className,
  as: Component = "p", // Set the default tag to 'h1'
  weight = "regular",
}: TypographyProps) => {
  return (
    <Component
      className={cn(
        "text-[0.6875rem]/[1rem]",
        fontWeightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
};