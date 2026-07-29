"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReservationCalendar from "@/components/reservationcalendar";

export default function ReservationActions({ reservation, isAdmin }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const now = new Date();
  const hasStarted = new Date(reservation.startDate) <= now;
  const isClosed = reservation.status !== "ACTIVE";

  async function callAction(action, extra = {}) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.details?.[0] ?? json.error ?? "Wystąpił błąd");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Nie udało się połączyć z serwerem");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Na pewno usunąć tę rezerwację na stałe? Tej operacji nie da się cofnąć.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Wystąpił błąd");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Nie udało się połączyć z serwerem");
      setLoading(false);
    }
  }

  if (isClosed) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {!hasStarted && (
          <button
            type="button"
            disabled={loading}
            onClick={() => callAction("cancel")}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Anuluj
          </button>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => setEditing((prev) => !prev)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {editing ? "Zwiń" : hasStarted ? "Przedłuż" : "Edytuj"}
        </button>

        {hasStarted && (
          <button
            type="button"
            disabled={loading}
            onClick={() => callAction("return")}
            className="rounded-lg border border-green-300 px-3 py-1.5 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
          >
            Oznacz jako zwrócony
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="rounded-lg border border-red-400 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Usuń całkowicie
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-4 max-w-xl">
          <ReservationCalendar
            equipment={reservation.equipment}
            mode="edit"
            existingReservation={reservation}
          />
        </div>
      )}
    </div>
  );
}