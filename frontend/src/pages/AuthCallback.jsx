import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const hash = location.hash || window.location.hash;
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) {
      navigate("/login");
      return;
    }
    const sid = m[1];
    (async () => {
      try {
        const { data } = await api.post("/auth/session", { session_id: sid });
        // clear hash
        window.history.replaceState({}, "", "/dashboard");
        navigate("/dashboard", { state: { user: data } });
      } catch (e) {
        console.error("Auth exchange failed", e);
        navigate("/login");
      }
    })();
  }, [location, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 text-sm">Signing you in…</div>
    </div>
  );
}
