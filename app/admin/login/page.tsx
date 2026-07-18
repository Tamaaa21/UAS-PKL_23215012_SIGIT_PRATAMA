"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn, User, Lock, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/captcha");
      const resText = await res.text();
      let data;
      try {
        data = JSON.parse(resText);
      } catch (e) {
        console.error("Response bukan JSON (/api/captcha):", resText);
        return;
      }

      if (data.success && data.captchaId) {
        setCaptchaId(data.captchaId);
        // Get captcha text from test endpoint (server-side)
        const textRes = await fetch(`/api/captcha/test?captchaId=${data.captchaId}`);
        const testText = await textRes.text();
        let textData;
        try {
          textData = JSON.parse(testText);
        } catch (e) {
          console.error("Response bukan JSON (/api/captcha/test):", testText);
          return;
        }

        if (textData.success) {
          setCaptchaText(textData.text);
        }
      }
    } catch (err) {
      console.error("Gagal load captcha:", err);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const refreshCaptcha = () => {
    setCaptchaInput("");
    fetchCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaInput.trim()) {
      setError("Captcha harus diisi");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          captchaId,
          captchaAnswer: captchaInput,
        }),
      });

      let data: Record<string, unknown> | null = null;
      try {
        const resText = await response.text();
        try {
          data = JSON.parse(resText);
        } catch {
          console.error("Response login bukan JSON:", resText);
          setError("Terjadi kesalahan pada respons server (Format tidak valid)");
          return;
        }
      } catch {
        setError("Gagal membaca respons server");
        return;
      }

      if (!response.ok) {
        setError((data?.message as string) || "Login gagal");
        refreshCaptcha();
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  // Generate captcha canvas from server text
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!captchaText || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 180;
    const height = 50;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    // Draw noise lines
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.5)`;
      ctx.lineWidth = Math.random() * 3;
      ctx.stroke();
    }

    // Draw noise dots
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.8)`;
      ctx.fill();
    }

    // Draw text
    ctx.font = "bold 28px sans-serif";
    ctx.textBaseline = "middle";
    for (let i = 0; i < captchaText.length; i++) {
      const char = captchaText[i];
      const x = 20 + i * 25;
      const y = height / 2 + (Math.random() * 10 - 5);
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = "#111827";
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, [captchaText]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-[#001133] via-[#002266] to-[#003399]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 md:p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#003399]/20 to-transparent" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white p-2 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <img src="/bmkg-logo.png" alt="BMKG Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[10px] font-bold text-[#003399] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Portal Admin
            </span>
            <h1 className="text-xl font-bold text-gray-800 mt-4">BMKG Maritim Tegal</h1>
            <p className="text-gray-400 text-xs mt-1.5">Stasiun Meteorologi Maritim Tegal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003399] transition-colors">
                  <User size={18} />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#003399] focus-visible:border-[#003399] h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 pl-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003399] transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#003399] focus-visible:border-[#003399] h-12 rounded-xl transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#003399] focus:outline-none transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-200/60">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verifikasi Keamanan</p>
                  <button type="button" onClick={refreshCaptcha} className="text-gray-400 hover:text-gray-600" title="Refresh CAPTCHA">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <canvas ref={canvasRef} width={180} height={50} className="w-full sm:w-[180px] rounded-md border border-gray-300 shadow-sm" />
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Ketik kode"
                    className="w-full sm:flex-1 h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-[#003399]"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || captchaLoading}
              className="w-full h-12 mt-4 bg-[#003399] hover:bg-[#002a80] text-white font-semibold rounded-xl transition-all duration-300 shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
