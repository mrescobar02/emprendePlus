/** @format */

// src/pages/AuthPage.tsx
import { useState } from "react";
import AuthForm from "../../components/AuthForm";
import UTPLogo from "../../components/Logos/UTPLogo";
import FiscLogo from "../../components/Logos/FiscLogo";
import BgVideo from "../../assets//LoginVideo.mp4";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleModeChange = (newMode: "signin" | "signup") => {
    setMode(newMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <video
        className="fixed object-cover w-full h-full "
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={BgVideo} type="video/mp4" />
      </video>

      {/* Logos arriba */}
      <div className="fixed z-20 top-3 left-10 flex items-center gap-6">
        <div className="w-20">
          <UTPLogo />
        </div>
        <div className="w-20 fill-green-700">
          <FiscLogo />
        </div>
        <div className="flex flex-col text-white">
          <span className="text-xl">Universidad Tecnológica de Panamá</span>
          <span>Facultad de Ing. Sistemas y Computación</span>
        </div>
      </div>

      {/* Lema lateral */}
      <div className="fixed top-1/2 left-3 transform -translate-y-1/2 translate-x-16 text-6xl text-white font-bold flex flex-col select-none leading-tight z-10">
        <span>Hazlo por ti.</span>
        <span>Aprende,</span>
        <span>Emprende,</span>
        <span>Y Vende</span>
      </div>
      <AuthForm mode={mode} onModeChange={handleModeChange} />
    </div>
  );
}
