// Editorial "Popularity" order for the home page, keyed by the catalog model
// slug (`models.slug`). Lower = shown first; it interleaves brands so the feed
// is not dominated by one maker. Carried over from the old make|model map in
// CarGrid.tsx (same order), plus models added by the catalog.
export const MODEL_POPULARITY: Record<string, number> = {
  // Tier 1: best-selling mass-market EVs (US)
  "tesla-model-y": 1,
  "tesla-model-3": 2,
  "ford-mustang-mach-e": 3,
  "hyundai-ioniq-5": 4,
  "chevrolet-equinox-ev": 5,
  "kia-ev6": 6,
  "rivian-r1s": 7,
  "bmw-i4": 8,
  "chevrolet-bolt": 8.5,
  "ford-f150-lightning": 9,
  "tesla-cybertruck": 10,
  "honda-prologue": 10.5,

  // Tier 2: popular mid-range
  "cadillac-lyriq": 11,
  "chevrolet-blazer-ev": 11.5,
  "mercedes-eqb-suv": 12,
  "rivian-r1t": 13,
  "vw-id-4": 14,
  "hyundai-ioniq-6": 15,
  "kia-ev9": 16,
  "hyundai-ioniq-9": 16.5,
  "nissan-ariya": 17,
  "volvo-ex30": 18,
  "toyota-bz4x": 19,
  "polestar-2": 20,
  "kia-ev3": 20.5,
  "chevrolet-silverado-ev": 20.7,

  // Tier 3: premium and enthusiast
  "tesla-model-s": 21,
  "rivian-r2": 22,
  "bmw-ix": 23,
  "audi-e-tron-q4": 24,
  "tesla-model-x": 25,
  "genesis-gv60": 26,
  "subaru-solterra": 27,
  "mini-cooper": 28,
  "kia-niro": 29,
  "hyundai-kona-electric": 30,

  // Tier 4: luxury and niche
  "cadillac-optiq": 31,
  "mercedes-eqe-sedan": 32,
  "bmw-i5": 33,
  "lucid-gravity": 34,
  "vw-id-buzz": 35,
  "volvo-xc40-recharge": 36,
  "nissan-leaf": 37,
  "hummer-ev": 38,
  "audi-e-tron-q8": 39,
  "porsche-taycan": 40,

  // Tier 5: ultra-luxury and less common
  "genesis-gv70": 41,
  "genesis-g80": 42,
  "porsche-macan": 43,
  "mercedes-eqs-sedan": 44,
  "mercedes-eqe-suv": 45,
  "mercedes-eqs-suv": 46,
  "jaguar-ipace": 47,
  "bmw-i7": 48,
  "audi-e-tron-gt": 49,
  "lucid-air": 50,

  // Tier 6: not sold in the US / niche international
  "vw-id-7": 55,
  "rivian-r3": 56,
  "rivian-fleet": 57,
  "cadillac-escalade": 58,
  "cadillac-celestiq": 59,
  "porsche-taycan-sport-turismo": 60,
  "porsche-taycan-cross-turismo": 61,
  "rolls-royce-spectre": 65,
  "rimac-nevera": 70,
  "xpeng-p7": 75,
  "nio-et7": 76,
  "byd-dolphin": 77,
  "byd-han-ev": 78,
  "byd-atto3": 79,
  "byd-seal": 80,
  "geely-geometry-c": 81,
  "renault-r5": 82,
  "renault-zoe": 83,
  "renault-megane": 84,
  "renault-scenic": 85,
  "citroen-ami": 86,
  "citroen-c4": 87,
  "citroen-c4x": 88,

  // Pushed to the bottom
  "polestar-four": 90,
  "polestar-three": 91,
  "tesla-semi": 95,
  "tesla-roadster": 96,
};

/** Fallback rank by make slug for models not in the map. */
export const BRAND_FALLBACK: Record<string, number> = {
  tesla: 60, chevrolet: 55, ford: 62, hyundai: 63, bmw: 64, kia: 65, "mercedes-benz": 66, rivian: 67,
  cadillac: 68, volkswagen: 69, toyota: 70, nissan: 71, volvo: 72, polestar: 73, lucid: 74, genesis: 75,
  subaru: 76, gmc: 77, porsche: 78, audi: 79, mini: 80, jaguar: 81, honda: 81.5, mazda: 82,
  "rolls-royce": 83, rimac: 84, byd: 85, nio: 86, xpeng: 87, geely: 88, renault: 89, citroen: 90,
  fisker: 98, canoo: 99,
};

export function popularityRank(modelSlug: string | undefined, makeSlug: string | undefined) {
  return MODEL_POPULARITY[modelSlug ?? ""] ?? BRAND_FALLBACK[makeSlug ?? ""] ?? 95;
}
