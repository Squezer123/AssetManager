"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminEquipmentTable({ equipment }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleDelete(id, name) {
    const confirmed = window.confirm(`Na pewno usunąć "${name}"?`);
    if (!confirmed) return;

    setError(null);
    setDeletingId(id);

    try {
      const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Nie udało się usunąć sprzętu");
        setDeletingId(null);
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Nie udało się połączyć z serwerem");
    } finally {
      setDeletingId(null);
    }
  }

  if (equipment.length === 0) {
    return (
      <p className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
        Brak sprzętu do wyświetlenia.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      {error && (
        <div className="border-b bg-red-50 px-6 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50 text-sm text-slate-500">
          <tr>
            <th className="px-6 py-3">Nazwa</th>
            <th className="px-6 py-3">Kategoria</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Rezerwacje</th>
            <th className="px-6 py-3 text-right">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-6 py-4 font-medium text-slate-900">
                {item.name}
              </td>
              <td className="px-6 py-4 text-slate-600">{item.category}</td>
              <td className="px-6 py-4">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-6 py-4 text-slate-600">
                {item.reservations.length > 0 ? (
                  <span className="text-orange-600">
                    {item.reservations.length} aktywna
                  </span>
                ) : (
                  <span className="text-slate-400">brak</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`./equipment/${item.id}`}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Podgląd
                  </Link>
                  <Link
                    href={`/admin/equipment/${item.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edytuj
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deletingId === item.id}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Usuwanie..." : "Usuń"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    AVAILABLE: "bg-green-100 text-green-700",
    MAINTENANCE: "bg-orange-100 text-orange-700",
    RETIRED: "bg-gray-200 text-gray-700",
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}