export type TicketPaymentMethod = "UPI" | "Credit / Debit Card" | "Bank Transfer";

export interface TicketListing {
  id: string;
  eventId: string;
  ticketCode: string;
  sellerName: string;
  price: number;
  paymentMethod: TicketPaymentMethod;
  paymentAccount: string;
  reason: string;
  status: "AVAILABLE" | "SOLD";
}

const STORAGE_KEY = "eventpulse-ticket-listings";

const initialListings: TicketListing[] = [
  {
    id: "listing_aiworkshop_001",
    eventId: "evt_aiworkshop",
    ticketCode: "EP-0312",
    sellerName: "Maya S.",
    price: 350,
    paymentMethod: "UPI",
    paymentAccount: "maya.s@upi",
    reason: "Schedule changed",
    status: "AVAILABLE",
  },
  {
    id: "listing_aiworkshop_002",
    eventId: "evt_aiworkshop",
    ticketCode: "EP-0318",
    sellerName: "Arjun K.",
    price: 400,
    paymentMethod: "Credit / Debit Card",
    paymentAccount: "Card ending 4821",
    reason: "Travel plans changed",
    status: "AVAILABLE",
  },
  {
    id: "listing_ascend_001",
    eventId: "evt_ascend2026",
    ticketCode: "EP-0247",
    sellerName: "Nisha P.",
    price: 550,
    paymentMethod: "UPI",
    paymentAccount: "nisha.p@upi",
    reason: "Cannot attend the event",
    status: "AVAILABLE",
  },
  {
    id: "listing_cultrave_001",
    eventId: "evt_cultrave",
    ticketCode: "EP-0194",
    sellerName: "Kabir R.",
    price: 250,
    paymentMethod: "Bank Transfer",
    paymentAccount: "XXXXXX7812",
    reason: "Duplicate booking",
    status: "AVAILABLE",
  },
];

function readListings(): TicketListing[] {
  if (typeof window === "undefined") return initialListings;

  const storedListings = window.localStorage.getItem(STORAGE_KEY);
  if (!storedListings) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialListings));
    return initialListings;
  }

  try {
    const listings = JSON.parse(storedListings) as TicketListing[];
    const initialListingIds = new Set(initialListings.map((listing) => listing.id));
    const storedById = new Map(listings.map((listing) => [listing.id, listing]));
    const mergedListings = [
      ...initialListings.map((listing) => ({ ...listing, ...storedById.get(listing.id) })),
      ...listings.filter((listing) => !initialListingIds.has(listing.id)),
    ];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedListings));
    return mergedListings;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialListings));
    return initialListings;
  }
}

export async function getTicketListings(eventId: string): Promise<TicketListing[]> {
  return readListings().filter((listing) => listing.eventId === eventId && listing.status === "AVAILABLE");
}

export async function createTicketListing(
  listing: Omit<TicketListing, "id" | "status">,
): Promise<TicketListing> {
  const newListing: TicketListing = {
    ...listing,
    id: `listing_${Date.now()}`,
    status: "AVAILABLE",
  };
  const listings = [...readListings(), newListing];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  }

  return newListing;
}

export async function purchaseTicketListing(
  listingId: string,
  buyerPayment: { method: TicketPaymentMethod; detail: string },
): Promise<{
  success: boolean;
  transactionId?: string;
  payoutMethod?: TicketPaymentMethod;
  payoutAccount?: string;
}> {
  const listings = readListings();
  const listing = listings.find((item) => item.id === listingId);

  if (!listing || listing.status !== "AVAILABLE" || !buyerPayment.detail.trim()) {
    return { success: false };
  }

  const updatedListings = listings.map((item) =>
    item.id === listingId ? { ...item, status: "SOLD" as const } : item,
  );

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedListings));
  }

  return {
    success: true,
    transactionId: `TXN-${Date.now().toString().slice(-9)}`,
    payoutMethod: listing.paymentMethod,
    payoutAccount: listing.paymentAccount,
  };
}
