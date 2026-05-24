/**
 * Retail price conversion utilities.
 *
 * Our models predict Nord Pool wholesale prices (EUR/MWh).
 * End-users see retail prices from their electricity supplier,
 * which include VAT (~25%) + supplier markup.
 *
 * Default factor 1.2 aligns app prices with observed retail data
 * (e.g. di.se/elpris/timpris).
 */

const EUR_SEK_RATE = 11.5;

/** Convert EUR/MWh → wholesale SEK/kWh (no retail markup). */
export function eurMwhToWholesaleSekKwh(eurMwh: number): number {
  return (eurMwh * EUR_SEK_RATE) / 1000;
}

/** Convert EUR/MWh wholesale → retail öre/kWh. */
export function eurMwhToRetailSekKwh(eurMwh: number): number {
  return toRetailPrice(eurMwhToWholesaleSekKwh(eurMwh));
}

/** Convert wholesale SEK/kWh → retail öre/kWh. */
export function toRetailPrice(wholesaleSekKwh: number): number {
  const factor = parseFloat(
    process.env.NEXT_PUBLIC_RETAIL_PRICE_FACTOR || "1.2"
  );
  return wholesaleSekKwh * factor * 100; // öre/kWh
}

/** Convert retail öre/kWh back to wholesale SEK/kWh (for editing/settings). */
export function toWholesalePrice(retailOreKwh: number): number {
  const factor = parseFloat(
    process.env.NEXT_PUBLIC_RETAIL_PRICE_FACTOR || "1.2"
  );
  return retailOreKwh / factor / 100;
}
