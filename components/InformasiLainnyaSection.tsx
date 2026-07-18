import {
  CloudSun,
  Compass,
  Globe,
  Activity,
  Waves,
  Plane,
  ChevronRight,
  ExternalLink,
  Ship
} from "lucide-react";

const infoItems = [
  {
    title: "Prakiraan Cuaca Kelurahan",
    desc: "Informasi prakiraan cuaca detail mencakup temperatur, kelembapan, dan angin hingga tingkat kelurahan di seluruh Indonesia.",
    url: "https://www.bmkg.go.id/cuaca/prakiraan-cuaca",
    Icon: CloudSun,
    bg: "bg-amber-50 border-amber-100/50",
    iconColor: "text-amber-500",
  },
  {
    title: "INA-WIS",
    desc: "Sistem Informasi Cuaca Maritim Terintegrasi (Indonesian Weather Information System) untuk mendukung keselamatan pelayaran.",
    url: "https://maritim.bmkg.go.id/inawis",
    Icon: Compass,
    bg: "bg-teal-50 border-teal-100/50",
    iconColor: "text-teal-600",
  },
  {
    title: "Satelit Cuaca Indonesia",
    desc: "Monitoring citra satelit cuaca secara realtime guna memantau pertumbuhan awan hujan dan cuaca ekstrem secara langsung.",
    url: "https://www.bmkg.go.id/cuaca/satelit",
    Icon: Globe,
    bg: "bg-indigo-50 border-indigo-100/50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Informasi Cuaca Pelabuhan Tegal",
    desc: "Informasi cuaca pelabuhan Tegal meliputi arah dan kecepatan angin, tinggi gelombang, suhu air, dan arah arus permukaan.",
    url: "https://www.bmkg.go.id/cuaca/maritim/pelabuhan/XL002",
    Icon: Ship,
    bg: "bg-rose-50 border-rose-100/50",
    iconColor: "text-rose-600",
  },
  {
    title: "Ocean Forecast System",
    desc: "Prakiraan dinamika oseanografi BMKG mencakup tinggi gelombang laut, arah arus permukaan, suhu air, dan salinitas perairan.",
    url: "https://peta-maritim.bmkg.go.id/ofs",
    Icon: Waves,
    bg: "bg-cyan-50 border-cyan-100/50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Informasi Cuaca Bandara",
    desc: "Laporan cuaca penerbangan terupdate (METAR, TAF, SIGMET) dari stasiun meteorologi bandar udara di seluruh Indonesia.",
    url: "https://www.bmkg.go.id/cuaca/bandara",
    Icon: Plane,
    bg: "bg-emerald-50 border-emerald-100/50",
    iconColor: "text-emerald-600",
  },
];

export default function InformasiLainnyaSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden border-b border-gray-150">
      {/* Decorative styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#003399] text-xs font-bold uppercase tracking-wider mb-4">
            Portal & Aplikasi Eksternal
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
            Informasi Cuaca & Geofisika
          </h2>
          <p className="text-slate-500 mt-3.5 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Akses cepat ke berbagai sistem monitoring cuaca, iklim, maritim, aviasi, dan kebencanaan BMKG Pusat.
          </p>
        </div>

        {/* 6-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {infoItems.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left h-full overflow-hidden"
            >
              {/* Corner decorative light color drop */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Icon Circle wrapper */}
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${item.bg} group-hover:scale-105 transition-transform duration-300`}>
                  <item.Icon size={20} className={item.iconColor} />
                </div>

                {/* Card Title */}
                <h3 className="text-slate-950 font-bold text-base mb-2 group-hover:text-[#003399] transition-colors leading-snug flex items-center gap-1.5">
                  {item.title}
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-60 transition-opacity text-slate-400 shrink-0" />
                </h3>

                {/* Card Description */}
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {/* Action Button at bottom */}
              <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#003399] group-hover:gap-2 transition-all mt-auto pt-2">
                <span>Klik disini</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
