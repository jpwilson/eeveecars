// Format a USD price with commas, no cents. Null/zero prices are "TBA" —
// showing "$0" reads as broken data.
export const formatPrice = (amount: number | null | undefined) => {
  if (!amount) return "TBA";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};
