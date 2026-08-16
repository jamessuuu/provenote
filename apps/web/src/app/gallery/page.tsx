import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/Gallery";

export const metadata: Metadata = {
  title: "Gallery of Limits",
  description:
    "Three adversarially-built demonstrations of what a valid C2PA provenance chain does not and cannot prove.",
};

export default function GalleryPage() {
  return <Gallery />;
}
