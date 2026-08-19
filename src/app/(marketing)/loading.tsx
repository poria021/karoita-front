/** Marketing route gap — canvas only, no skeleton bones (rule 80). */
export default function MarketingLoading() {
  return (
    <div
      className="min-h-dvh w-full bg-kv-canvas"
      aria-busy="true"
      aria-live="polite"
    />
  );
}
