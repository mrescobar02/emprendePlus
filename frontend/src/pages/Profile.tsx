/** @format */

// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Pencil, CheckIcon, XIcon } from "lucide-react";
import { useUserWithBusiness } from "../hooks/useUserBusiness";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [editingField, setEditingField] = useState<"name" | "email" | null>(
    null
  );
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [profile, setProfile] = useState({ name: "", email: "" });
  const { userData } = useUserWithBusiness();
  const businessName = userData?.business_name || "EmprendePlus";

  useEffect(() => {
    if (BYPASS_AUTH) {
      setProfile({ name: "Dev User", email: "dev@localhost.com" });
      setDraft({ name: "Dev User", email: "dev@localhost.com" });
    } else if (isAuthenticated && user) {
      setProfile({ name: user.name || "", email: user.email || "" });
      setDraft({ name: user.name || "", email: user.email || "" });
    }
  }, [user, isAuthenticated]);

  if (isLoading) return <p className="p-6 text-center">Cargando perfil…</p>;

  const saveField = (field: "name" | "email") => {
    setProfile((prev) => ({ ...prev, [field]: draft[field] }));
    setEditingField(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Mi Perfil
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src={user?.picture || "/default-avatar.png"}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 dark:border-neutral-700"
            />
            <div className="text-center">
              <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                Emprendedor
              </p>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {profile.name}
              </h2>
            </div>
          </div>

          {/* Campos editables*/}
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm text-gray-500 dark:text-neutral-400">
                Nombre
              </label>
              {editingField === "name" ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, name: e.target.value }))
                    }
                    className="flex-1 border border-gray-300 dark:border-neutral-600 rounded px-3 py-2 bg-white dark:bg-neutral-700 text-gray-800 dark:text-neutral-200"
                  />
                  <button
                    onClick={() => saveField("name")}
                    className="text-green-600 hover:text-green-800"
                  >
                    <CheckIcon size={20} />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-gray-800 dark:text-neutral-200">
                    {profile.name}
                  </span>
                  <button
                    onClick={() => setEditingField("name")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-500 dark:text-neutral-400">
                Email
              </label>
              {editingField === "email" ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, email: e.target.value }))
                    }
                    className="flex-1 border border-gray-300 dark:border-neutral-600 rounded px-3 py-2 bg-white dark:bg-neutral-700 text-gray-800 dark:text-neutral-200"
                  />
                  <button
                    onClick={() => saveField("email")}
                    className="text-green-600 hover:text-green-800"
                  >
                    <CheckIcon size={20} />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-gray-800 dark:text-neutral-200">
                    {profile.email}
                  </span>
                  <button
                    onClick={() => setEditingField("email")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-6">
          {/* Datos adicionales */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              Detalles de mi emprendimiento
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-600 dark:text-neutral-400">
              <div>
                <dt className="font-semibold text-gray-800 dark:text-neutral-200">
                  Nombre de la empresa
                </dt>
                <dd>{businessName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800 dark:text-neutral-200">
                  Categoría
                </dt>
                <dd>Tecnología</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800 dark:text-neutral-200">
                  Fecha de registro
                </dt>
                <dd>01 Ene, 2024</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800 dark:text-neutral-200">
                  Estado
                </dt>
                <dd>Activo</dd>
              </div>
              {/* Se pueden añadir mas campos*/}
            </dl>
          </div>

          {/* Opciones adicionales */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              Configuración
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/settings"
                  className="flex items-center gap-3 text-gray-800 hover:text-blue-600 dark:text-neutral-200 dark:hover:text-blue-500"
                >
                  {/* ícono de ajustes */}
                  <svg className="size-4" /*…*/ />
                  Ajustes de cuenta
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="flex items-center gap-3 text-gray-800 hover:text-blue-600 dark:text-neutral-200 dark:hover:text-blue-500"
                >
                  {/* ícono de ayuda */}
                  <svg className="size-4" /*…*/ />
                  Ayuda y soporte
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
