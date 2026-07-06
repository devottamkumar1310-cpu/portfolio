import { BIO_SUMMARY } from "../data";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#050505]/40 px-4 sm:px-6 lg:px-8 py-8 text-center text-xs font-sans text-gray-550 print:hidden">
      <div className="max-w-4xl mx-auto space-y-2">
        <p className="text-gray-500 font-medium">
          Designed and built from first principles.
        </p>
        <p className="text-gray-650 text-[11px]">
          © {currentYear} {BIO_SUMMARY.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
