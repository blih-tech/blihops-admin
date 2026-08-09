export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center rounded-md bg-muted/50 px-4 text-center">
      <h1 className="font-heading text-lg font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
