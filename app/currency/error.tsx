'use client'

export default function CurrencyError() {
  return (
    <div className="flex h-32 items-center justify-center rounded-md bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">Kunde inte läsa in växelkursen.</p>
    </div>
  );
}
