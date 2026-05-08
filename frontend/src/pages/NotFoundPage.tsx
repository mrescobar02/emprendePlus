/** @format */

import { useNavigate } from "react-router-dom";
import EmprendePlusLogo from "../components/Logos/EmprendePlusLogo";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 p-8">
      <div className="absolute w-96 top-8 left-8">
        <EmprendePlusLogo />
      </div>
      <div className="mx-auto w-[70dvw] h-fit flex flex-row justify-between gap-4 md:gap-8">
        {/* Left: Text */}
        <div className="text-left space-y-6 flex flex-col justify-center items-start">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-white">
            Uups!
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            No podemos encontrar la página que estás buscando.
          </p>
          <p className="text-md text-gray-500 dark:text-neutral-500">
            Codigo de error: 404
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-block bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al inicio
          </button>
        </div>

        {/* Right: Animation */}
        <div className="flex items-center justify-center">
          <div className="w-full h-fit rounded-full overflow-clip">
            <img
              src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
              alt="Not Found Animation"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
