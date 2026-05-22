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

/** Convert EUR/MWh wholesale → retail SEK/kWh. */
export function eurMwhToRetailSekKwh(eurMwh: number): number {
  const wholesaleSekKwh = (eurMwh * EUR_SEK_RATE) / 1000;
  return toRetailPrice(wholesaleSekKwh);
}

/** Convert wholesale SEK/kWh → retail SEK/kWh. */
export function toRetailPrice(wholesaleSekKwh: number): number {
  const factor = parseFloat(
    process.env.NEXT_PUBLIC_RETAIL_PRICE_FACTOR || "1.2"
  );
  return wholesaleSekKwh * factor;
}

/** Convert retail SEK/kWh back to wholesale (for editing/settings). */
export function toWholesalePrice(retailSekKwh: number): number {
  const factor = parseFloat(
    process.env.NEXT_PUBLIC_RETAIL_PRICE_FACTOR || "1.2"
  );
  return retailSekKwh / factor;
}
