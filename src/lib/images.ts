import manifest from "@/data/vienna-cuts-images.json";
export type ImageName =
  | "hero-desktop"
  | "hero-mobile"
  | "studio-interior"
  | "studio-interior-alt"
  | "studio-reception"
  | "studio-exterior"
  | "studio-lounge"
  | "studio-lounge-alt"
  | "studio-gallery"
  | "service-haircut"
  | "service-beard"
  | "service-hair-beard"
  | "service-skin-fade"
  | "service-grooming"
  | "service-shave"
  | "team-alex"
  | "team-lukas"
  | "team-emre"
  | "team-david"
  | "gallery-cut-detail"
  | "gallery-beard-detail"
  | "gallery-fade-detail"
  | "gallery-grooming-detail"
  | "gallery-clipper-work"
  | "gallery-scissors"
  | "gallery-products"
  | "gallery-salon-products"
  | "gallery-coffee"
  | "gallery-tools"
  | "gallery-facade"
  | "gallery-vienna"
  | "gallery-vienna-architecture"
  | "gallery-neon"
  | "concept-fade-before"
  | "concept-fade-after"
  | "concept-side-before"
  | "concept-side-after"
  | "concept-beard-before"
  | "concept-beard-after";
export function imageAsset(name: ImageName) {
  const asset = manifest.images.find((image) => image.file === `${name}.webp`)!;
  return { ...asset, src: `/images/vienna-cuts/${asset.file}` };
}
export const galleryImages = manifest.images
  .filter((image) => image.category === "gallery")
  .map((image) => image.file.replace(".webp", "") as ImageName);
export const serviceImages: Record<string, ImageName> = {
  "classic-haircut": "service-haircut",
  "beard-trim": "service-beard",
  "haircut-beard": "service-hair-beard",
  "skin-fade": "service-skin-fade",
  "premium-grooming": "service-grooming",
};
