import { UserAccount } from "../types";

// Removed / Banned accounts list (e.g. sherie.szubski band)
export const BANNED_BAND_EMAILS = ["sherie.szubski@gmail.com"];

export function isBandBanned(email?: string, name?: string): boolean {
  if (email && BANNED_BAND_EMAILS.includes(email.trim().toLowerCase())) {
    return true;
  }
  if (email && email.toLowerCase().includes("sherie.szubski")) {
    return true;
  }
  if (name && (name.toLowerCase().includes("sherie") && name.toLowerCase().includes("szubski"))) {
    return true;
  }
  return false;
}

export function isEmailRevoked(email?: string): boolean {
  if (!email) return false;
  return isBandBanned(email);
}

// Special perpetual lifetime pass accounts with full unmasked access for life
export const PERPETUAL_30_DAY_PASS_EMAILS = ["littlerusty@gmail.com", "giglizard.us@gmail.com"];

export function isPerpetualPassEmail(email?: string): boolean {
  if (!email) return false;
  return PERPETUAL_30_DAY_PASS_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Checks if a user is currently logged into an account
 */
export function isUserLoggedIn(account?: Partial<UserAccount> | null): boolean {
  return Boolean(
    account && 
    account.contactEmail && 
    account.contactEmail.trim().length > 0 && 
    account.contactEmail.includes("@")
  );
}

/**
 * Core Policy: Only paid subscribers that are not expired can see band contact info,
 * and ONLY when they are logged into their account.
 */
export function canViewBandContacts(account?: Partial<UserAccount> | null): boolean {
  if (!isUserLoggedIn(account)) {
    return false;
  }
  return isAccessActive(account);
}

/**
 * Access check helper:
 * - littlerusty@gmail.com: Full unmasked access to the entire site for life.
 * - Paid pass users: Unmasked access while accessExpiresAt is in the future.
 * - All other users: Free tier account with masked contacts until 30-day pass ($9.99) is purchased.
 */
export function isAccessActive(venue?: Partial<UserAccount> | null): boolean {
  if (!venue) return false;
  if (!venue.contactEmail || !venue.contactEmail.trim()) return false;
  if (isEmailRevoked(venue.contactEmail)) {
    return false;
  }
  // Perpetual Lifetime Pass for littlerusty@gmail.com (Full unmasked access for life)
  if (isPerpetualPassEmail(venue.contactEmail)) {
    return true;
  }
  return Boolean(venue.accessExpiresAt && new Date(venue.accessExpiresAt) > new Date());
}

/**
 * Returns remaining days of active access (0 if expired or inactive)
 */
export function getAccessRemainingDays(venue?: Partial<UserAccount> | null): number {
  if (!venue) return 0;
  if (!venue.contactEmail || !venue.contactEmail.trim()) return 0;
  if (isEmailRevoked(venue.contactEmail)) return 0;
  
  if (isPerpetualPassEmail(venue.contactEmail)) {
    return 99999; // Perpetual lifetime pass
  }

  if (!venue.accessExpiresAt) return 0;
  
  const expiryTime = new Date(venue.accessExpiresAt).getTime();
  if (isNaN(expiryTime) || expiryTime <= 0) return 0;
  
  const diffMs = expiryTime - Date.now();
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Formats full expiration status overview
 */
export function getAccessStatusDetails(venue?: Partial<UserAccount> | null) {
  const isLoggedIn = isUserLoggedIn(venue);
  const isPerpetual = isLoggedIn && isPerpetualPassEmail(venue?.contactEmail);
  const active = isLoggedIn && (isPerpetual || isAccessActive(venue));
  const hadPass = Boolean(isPerpetual || venue?.accessExpiresAt || venue?.lastPaymentDate || venue?.hasPaidAccess || venue?.isPremium);
  const isExpired = isLoggedIn && hadPass && !active;
  const remainingDays = isLoggedIn ? getAccessRemainingDays(venue) : 0;
  const autoRenew = Boolean(isLoggedIn && (isPerpetual || venue?.autoRenew));

  let formattedExpiry = "None";
  let statusType: "not_logged_in" | "active_owner" | "active_paid" | "expired" | "unpaid" = "not_logged_in";

  if (!isLoggedIn) {
    statusType = "not_logged_in";
    formattedExpiry = "Login Required";
  } else if (isPerpetual) {
    statusType = "active_owner";
    formattedExpiry = "Never Expires (Perpetual Lifetime Access)";
  } else if (venue?.accessExpiresAt) {
    try {
      formattedExpiry = new Date(venue.accessExpiresAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      formattedExpiry = venue.accessExpiresAt;
    }
    statusType = active ? "active_paid" : "expired";
  } else {
    statusType = "unpaid";
  }

  let bannerText = "";
  if (!isLoggedIn) {
    bannerText = "🔒 Login Required — Only paid subscribers with up-to-date subscriptions can view band contacts";
  } else if (isPerpetual) {
    bannerText = "🟢 Lifetime VIP Owner Pass Active (Full Unmasked Access for Life • Never Expires)";
  } else if (active) {
    const renewWord = autoRenew ? "Renews" : "Expires";
    bannerText = `🟢 30-Day All Access Pass Active (${renewWord} in ${remainingDays} ${remainingDays === 1 ? "day" : "days"})`;
  } else if (isExpired) {
    bannerText = "🔒 30-Day Access Expired — Renew for $9.99 to Unlock Contact Info";
  } else {
    bannerText = "🔒 Free Tier (Contacts Masked) — Get 30-Day All Access Pass ($9.99) to Unlock Contacts";
  }

  return {
    isLoggedIn,
    isActive: active,
    isExpired: isPerpetual ? false : isExpired,
    remainingDays,
    formattedExpiry,
    renewsMonthly: autoRenew,
    isPerpetual,
    bannerText,
    statusType
  };
}

/**
 * Masks email address for locked/expired accounts ('--****')
 */
export function maskContactEmail(email?: string): string {
  return "--****";
}

/**
 * Masks phone number for locked/expired accounts ('--****')
 */
export function maskContactPhone(phone?: string): string {
  return "--****";
}

/**
 * Masks external band listen/EPK/website links for locked/expired accounts ('--****')
 */
export function maskListenLink(_url?: string | null): string {
  return "--****";
}

// ==========================================
// 2 Free Unlocks System Helpers
// ==========================================
export const DEFAULT_FREE_UNLOCKS = 2;

export function getUserUnlockStorageKey(email?: string | null): string | null {
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !clean.includes("@")) return null;
  return `giglizard_user_unlocks_v1_${clean}`;
}

export function readStoredUserUnlocks(
  email?: string | null
): { free_unlocks: number; unlocked_band_ids: string[] } | null {
  const key = getUserUnlockStorageKey(email);
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.unlocked_band_ids)
      ? parsed.unlocked_band_ids.map((id: any) => String(id).trim()).filter(Boolean)
      : [];
    const unlocks =
      typeof parsed?.free_unlocks === "number" && !Number.isNaN(parsed.free_unlocks)
        ? Math.max(0, Math.floor(parsed.free_unlocks))
        : Math.max(0, DEFAULT_FREE_UNLOCKS - ids.length);
    return {
      free_unlocks: unlocks,
      unlocked_band_ids: Array.from(new Set(ids))
    };
  } catch {
    return null;
  }
}

export function saveStoredUserUnlocks(
  email: string,
  freeUnlocks: number,
  unlockedBandIds: string[]
): void {
  const key = getUserUnlockStorageKey(email);
  if (!key || typeof window === "undefined") return;
  try {
    const cleanIds = Array.from(
      new Set((unlockedBandIds || []).map((id) => String(id).trim()).filter(Boolean))
    );
    const cleanCount = Math.max(0, Math.floor(freeUnlocks));
    localStorage.setItem(
      key,
      JSON.stringify({
        free_unlocks: cleanCount,
        unlocked_band_ids: cleanIds
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function getUserUnlockedBandIds(account?: Partial<UserAccount> | null): string[] {
  if (!isUserLoggedIn(account)) return [];
  const merged = new Set<string>();
  const fromSnake = Array.isArray(account?.unlocked_band_ids) ? account.unlocked_band_ids : [];
  const fromCamel = Array.isArray(account?.unlockedBandIds) ? account.unlockedBandIds : [];
  const stored = readStoredUserUnlocks(account?.contactEmail || account?.email);

  for (const id of [...fromSnake, ...fromCamel, ...(stored?.unlocked_band_ids || [])]) {
    if (typeof id === "string" && id.trim()) {
      merged.add(id.trim());
    }
  }
  return Array.from(merged);
}

export function getUserFreeUnlocks(account?: Partial<UserAccount> | null): number {
  if (!isUserLoggedIn(account)) return 0;

  const unlockedIds = getUserUnlockedBandIds(account);
  const stored = readStoredUserUnlocks(account?.contactEmail || account?.email);

  const rawCandidates: number[] = [];
  if (typeof account?.free_unlocks === "number" && !Number.isNaN(account.free_unlocks)) {
    rawCandidates.push(Math.max(0, Math.floor(account.free_unlocks)));
  }
  if (typeof account?.freeUnlocks === "number" && !Number.isNaN(account.freeUnlocks)) {
    rawCandidates.push(Math.max(0, Math.floor(account.freeUnlocks)));
  }
  if (stored && typeof stored.free_unlocks === "number") {
    rawCandidates.push(Math.max(0, Math.floor(stored.free_unlocks)));
  }

  if (rawCandidates.length > 0) {
    // Use the lowest synced count so unlocks consumed in one tab/store aren't inflated by stale defaults
    return Math.min(...rawCandidates);
  }

  return Math.max(0, DEFAULT_FREE_UNLOCKS - unlockedIds.length);
}

export function isBandUnlockedForUser(
  account?: Partial<UserAccount> | null,
  bandId?: string | null
): boolean {
  if (!isUserLoggedIn(account)) return false;
  if (isAccessActive(account)) return true;
  if (!bandId) return false;
  const cleanId = bandId.trim();
  if (!cleanId) return false;
  return getUserUnlockedBandIds(account).includes(cleanId);
}

export function normalizeUserUnlockFields<T extends Partial<UserAccount>>(account: T): T {
  const email = account?.contactEmail || account?.email;
  if (!email) return account;
  const unlockedIds = getUserUnlockedBandIds(account);
  const freeUnlocks = getUserFreeUnlocks(account);
  saveStoredUserUnlocks(email, freeUnlocks, unlockedIds);
  return {
    ...account,
    free_unlocks: freeUnlocks,
    freeUnlocks,
    unlocked_band_ids: unlockedIds,
    unlockedBandIds: unlockedIds
  };
}



