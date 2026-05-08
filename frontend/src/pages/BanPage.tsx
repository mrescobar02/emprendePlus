/** @format */

import { useCentralizedLogout } from "../hooks/useCentralizedLogout";

export default function BannedPage() {
  const centralizedLogout = useCentralizedLogout();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Cuenta bloqueada
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
          Tu cuenta ha sido bloqueada por actividad sospechosa.
          <br />
          Si crees que esto es un error, contacta a soporte.
        </p>
        <button
          onClick={centralizedLogout}
          className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white transition mt-2"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
