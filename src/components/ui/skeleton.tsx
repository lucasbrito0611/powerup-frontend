import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-light-grey/80 dark:bg-dark-grey/40", className)}
      {...props}
    />
  );
}

export { Skeleton };
