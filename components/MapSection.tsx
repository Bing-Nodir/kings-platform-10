"use client";

import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function MapSection() {
  return (
    <section className="cv-auto relative overflow-hidden bg-white py-16 dark:bg-black md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Oflayn va Onlayn
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">
            Global{" "}
            <span className="text-neutral-400">
              {"Ekotizim".split("").map((char, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block text-blue-600 dark:text-cyan-400"
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </h2>
          <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-400">
            Toshkentdan tortib dunyoning turli nuqtalarigacha ta&apos;lim oling. Oflayn markazlarimiz va xalqaro onlayn platformamiz sizni kutmoqda.
          </p>
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <WorldMap
            lineColor="#0ea5e9"
            dots={[
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: 51.5074, lng: -0.1278 }, // London
              },
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: 40.7128, lng: -74.0060 }, // New York
              },
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: 25.2048, lng: 55.2708 }, // Dubai
              },
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: 1.3521, lng: 103.8198 }, // Singapore
              },
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: -15.7975, lng: -47.8919 }, // Braziliya (Janubiy Amerika)
              },
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: -1.2921, lng: 36.8219 }, // Nayrobi (Afrika)
              },
              {
                start: { lat: 41.2995, lng: 69.2401 }, // Tashkent
                end: { lat: 34.0522, lng: -118.2437 }, // Los Anjeles (Shimoliy Amerika)
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
