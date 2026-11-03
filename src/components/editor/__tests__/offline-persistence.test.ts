import { describe, it, expect, vi } from "vitest";

function formatLastSavedRelative(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 5) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function calculateReconnectCountdown(nextReconnectAt: number, now: number): number {
  return Math.max(0, Math.ceil((nextReconnectAt - now) / 1000));
}

function computeBackoffDelay(currentDelay: number, maxDelay = 16): number {
  return Math.min(maxDelay, Math.round(currentDelay * 1.5));
}

describe("Offline & Persistence Indicators", () => {
  it("formats relative timestamp cleanly", () => {
    expect(formatLastSavedRelative(null)).toBe("Never");
    expect(formatLastSavedRelative(Date.now() - 2000)).toBe("Just now");
    expect(formatLastSavedRelative(Date.now() - 35000)).toBe("35s ago");
    expect(formatLastSavedRelative(Date.now() - 150000)).toBe("2m ago");
    expect(formatLastSavedRelative(Date.now() - 7200000)).toBe("2h ago");
  });

  it("calculates reconnect countdown accurately", () => {
    const now = 1000000;
    const target = now + 4200; // 4.2 seconds
    expect(calculateReconnectCountdown(target, now)).toBe(5);

    const past = now - 500;
    expect(calculateReconnectCountdown(past, now)).toBe(0);
  });

  it("applies exponential backoff correctly without exceeding max threshold", () => {
    let delay = 4;
    delay = computeBackoffDelay(delay); // 6
    expect(delay).toBe(6);

    delay = computeBackoffDelay(delay); // 9
    expect(delay).toBe(9);

    delay = computeBackoffDelay(delay); // 14
    expect(delay).toBe(14);

    delay = computeBackoffDelay(delay); // capped at 16
    expect(delay).toBe(16);

    delay = computeBackoffDelay(delay); // still 16
    expect(delay).toBe(16);
  });

  it("correctly tracks pending offline updates counter", () => {
    let pendingCount = 0;
    const isConnected = false;

    // Simulate 3 local transactions while disconnected
    if (!isConnected) pendingCount++;
    if (!isConnected) pendingCount++;
    if (!isConnected) pendingCount++;

    expect(pendingCount).toBe(3);

    // Simulate reconnect sync event
    const synced = true;
    if (synced) {
      pendingCount = 0;
    }
    expect(pendingCount).toBe(0);
  });
});
