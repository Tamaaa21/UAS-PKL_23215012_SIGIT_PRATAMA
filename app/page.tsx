import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PrakiraanSection from "@/components/PrakiraanSection";
import BuletinSection from "@/components/BuletinSection";
import InformasiLainnyaSection from "@/components/InformasiLainnyaSection";
import EarthquakeCard from "@/components/EarthquakeCard";
import LayananSection from "@/components/LayananSection";
import KegiatanSection from "@/components/KegiatanSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { db, schema } from "@/db";
import { desc, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda",
  description: "BMKG Stasiun Meteorologi Maritim Tegal - Informasi cuaca maritim terkini",
};

export const dynamic = "force-dynamic";

function processKegiatanData(data: any[]) {
  return data.map((d: any) => {
    const imgs: string[] = [];
    const imgUrls = Array.isArray(d.image_urls) ? d.image_urls : [];
    if (imgUrls.length > 0) {
      imgs.push(...imgUrls.filter(Boolean));
    } else if (d.url && !d.url.includes("img.youtube.com")) {
      imgs.push(d.url);
    } else if (d.url) {
      imgs.push(d.url);
    }
    return {
      title: d.title,
      date: d.event_date
        ? new Date(d.event_date).toLocaleDateString("id-ID")
        : new Date(d.created_at).toLocaleDateString("id-ID"),
      category: d.category || "Lainnya",
      image: imgs[0] || "",
      images: imgs,
      description: d.description || "",
      youtube_url: d.youtube_url || "",
      file_type: d.file_type || "",
    };
  });
}

async function getHomepageData() {
  try {
    const [publications, prakiraanRows, categories, layananCards, kegiatanDocs, heroImages] =
      await Promise.all([
        db
          .select()
          .from(schema.publications)
          .orderBy(desc(schema.publications.created_at))
          .limit(1),
        db
          .select()
          .from(schema.prakiraan_images)
          .leftJoin(
            schema.prakiraan_categories,
            eq(schema.prakiraan_images.category_id, schema.prakiraan_categories.id)
          )
          .orderBy(asc(schema.prakiraan_images.created_at)),
        db.select().from(schema.prakiraan_categories).orderBy(asc(schema.prakiraan_categories.name)),
        db.select().from(schema.layanan_cards).orderBy(asc(schema.layanan_cards.created_at)),
        db
          .select()
          .from(schema.kegiatan_documents)
          .orderBy(desc(schema.kegiatan_documents.created_at)),
        db.select().from(schema.hero_images).orderBy(asc(schema.hero_images.order_index)),
      ]);

    const prakiraanCards = prakiraanRows.map((row) => {
      const img = { ...row.prakiraan_images } as Record<string, unknown>;
      const cat = row.prakiraan_categories;
      img.category = cat
        ? {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: cat.icon,
          }
        : null;
      return img;
    });

    const heroImageUrls = heroImages.map((h) => h.url).filter(Boolean);

    return {
      buletin: publications.length > 0 ? publications[0] : null,
      prakiraanCards,
      categories,
      layananCards,
      kegiatanItems: processKegiatanData(kegiatanDocs),
      heroImageUrls,
    };
  } catch (error) {
    console.error("Gagal mengambil data homepage:", error);
    return {
      buletin: null,
      prakiraanCards: [],
      categories: [],
      layananCards: [],
      kegiatanItems: [],
      heroImageUrls: [],
    };
  }
}

export default async function Home() {
  const data = await getHomepageData();

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection initialImages={data.heroImageUrls} />
      <BuletinSection initialBuletin={data.buletin} />
      <PrakiraanSection limit={4} initialCards={data.prakiraanCards} initialCategories={data.categories} />
      <InformasiLainnyaSection />
      <EarthquakeCard />
      <LayananSection limit={4} initialServices={data.layananCards} />
      <KegiatanSection limit={4} initialItems={data.kegiatanItems} />
      <ContactSection />
      <Footer />
    </main>
  );
}
