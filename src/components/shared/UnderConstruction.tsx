import { cn } from '@/lib/utils';

type UnderConstructionProps = {
  className?: string;
  title?: string;
  description?: string;
};

export function UnderConstruction({
  className,
  title = 'Under construction',
  description = 'This page is being built. Check back soon.',
}: UnderConstructionProps) {
  return (
    <div
      className={cn(
        'flex min-h-[50vh] w-full flex-1 flex-col items-center justify-center bg-background px-4 text-center',
        className,
      )}
    >
      <div className="mx-auto max-w-lg">
        <p className="font-sans text-[10px] font-medium tracking-widest text-muted-foreground uppercase sm:text-xs">
          Coming soon
        </p>
        <h1 className="mt-2 font-heading text-lg font-semibold tracking-tight text-foreground sm:mt-3 sm:text-3xl md:text-4xl">
          {title}
        </h1>
        <p className="mt-1.5 font-sans text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
