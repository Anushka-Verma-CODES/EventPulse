export interface MarketplaceListing {
  id: string;
  sellerName: string;
  reason: string;
  price: number;
  paymentPreference: string;
  status: "Available" | "Sold";
}

// In-memory mock "marketplace" — mutated when a listing is bought,
// same pattern as the scanner ticket store. A real backend would
// expose this as GET /events/:id/listings and POST /listings/:id/buy.
export const marketplaceListings: MarketplaceListing[] = [
  {
    id: "EP-0312",
    sellerName: "Maya S.",
    reason: "Schedule changed",
    price: 350,
    paymentPreference: "UPI",
    status: "Available",
  },
  {
    id: "EP-0318",
    sellerName: "Arjun K.",
    reason: "Travel plans changed",
    price: 400,
    paymentPreference: "Credit / Debit Card",
    status: "Available",
  },
  {
    id: "EP-0001",
    sellerName: "Rohan Mehta",
    reason: "hello",
    price: 350,
    paymentPreference: "UPI",
    status: "Available",
  },
];

export function buyListing(listingId: string): { newTicketId: string } | null {
  const listing = marketplaceListings.find((l) => l.id === listingId);
  if (!listing || listing.status !== "Available") return null;

  // Mirrors the official transfer workflow: the seller's ticket is
  // invalidated and a brand-new ticket is issued to the buyer — never
  // a reused QR.
  listing.status = "Sold";
  const newTicketId = `TKT-${Math.floor(10000 + Math.random() * 89999)}`;
  return { newTicketId };
}
