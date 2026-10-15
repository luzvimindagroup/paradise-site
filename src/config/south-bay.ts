// ZIP codes counted as "South Bay" in reports. Working list from the build brief:
// pending Alan's check before it is relied on. 92139 reaches a little north of Skyline Dr; we accept that.
export const SOUTH_BAY_ZIPS = [
  "91950", "91951", // National City
  "92139",          // Paradise Hills / Bay Terraces
  "91902",          // Bonita
  "91910", "91911", "91913", "91914", "91915", // Chula Vista
  "91932",          // Imperial Beach
  "92154",          // Otay Mesa / Nestor
  "92173",          // San Ysidro
] as const;
