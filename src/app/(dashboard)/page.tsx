export default function OverviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center rounded-xl bg-muted/50 px-4 text-center">
        <h1 className="font-heading text-lg font-semibold tracking-[-0.02em] text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leads, companies, talent, and content operations.
        </p>
      </div>
    </div>
  );
}
