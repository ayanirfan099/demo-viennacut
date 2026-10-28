"use client";
import Image, { getImageProps } from "next/image";
import { imageAsset, type ImageName } from "@/lib/images";
import { useLanguage } from "./LanguageProvider";
export function AssetImage({
  name,
  className,
  sizes = "(max-width: 700px) 90vw, 33vw",
}: {
  name: ImageName;
  className?: string;
  sizes?: string;
}) {
  const { t } = useLanguage();
  const asset = imageAsset(name);
  return (
    <Image
      className={className}
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={t(asset.alt_de, asset.alt_en)}
      sizes={sizes}
    />
  );
}
export function HeroMedia() {
  const { t } = useLanguage();
  const desktop = imageAsset("hero-desktop");
  const mobile = imageAsset("hero-mobile");
  const { props: desk } = getImageProps({
    src: desktop.src,
    width: desktop.width,
    height: desktop.height,
    alt: t(desktop.alt_de, desktop.alt_en),
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  });
  const { props: mob } = getImageProps({
    src: mobile.src,
    width: mobile.width,
    height: mobile.height,
    alt: t(mobile.alt_de, mobile.alt_en),
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  });
  return (
    <picture className="hero-picture">
      <source media="(min-width: 701px)" srcSet={desk.srcSet} sizes="100vw" />
      {/* Native img is required for art-directed picture sources. */}
      <img {...mob} alt={mob.alt} />
    </picture>
  );
}
export function ImageCreditNotice() {
  const { t } = useLanguage();
  return (
    <p className="image-credit">
      {t(
        "Konzept-Demo · KI-generierte Bilder · Fiktives Studio",
        "Concept demo · AI-generated imagery · Fictional studio",
      )}
    </p>
  );
}
