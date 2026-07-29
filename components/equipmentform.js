"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["LAPTOP", "PHONE", "CAMERA", "OTHER"];
const STATUSES = ["AVAILABLE", "MAINTENANCE", "RETIRED"];

const emptySpecFor = {
  LAPTOP: { manufacturer: "", cpu: "", ram: "", storage: "", os: "" },
  PHONE: { manufacturer: "", model: "", storage: "", os: "", imei: "" },
  CAMERA: { manufacturer: "", sensorType: "", resolution: "", lensMount: "" },
  OTHER: null,
};

export default function EquipmentForm({ initialData = null }) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    category: initialData?.category ?? "LAPTOP",
    status: initialData?.status ?? "AVAILABLE",
    bufferDays: initialData?.bufferDays ?? 1,
    imageUrl: initialData?.imageUrl ?? "",
  });

  const [spec, setSpec] = useState(() => {
    if (initialData?.category === "LAPTOP" && initialData?.laptopSpec) {
      return { ...emptySpecFor.LAPTOP, ...initialData.laptopSpec };
    }
    if (initialData?.category === "PHONE" && initialData?.phoneSpec) {
      return { ...emptySpecFor.PHONE, ...initialData.phoneSpec };
    }
    if (initialData?.category === "CAMERA" && initialData?.cameraSpec) {
      return { ...emptySpecFor.CAMERA, ...initialData.cameraSpec };
    }
    return emptySpecFor[initialData?.category ?? "LAPTOP"];
  });

  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCategoryChange(e) {
    const category = e.target.value;
    setForm((prev) => ({ ...prev, category }));
    setSpec(emptySpecFor[category]);
  }

  function handleSpecChange(e) {
    const { name, value } = e.target;
    setSpec((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const payload = {
      ...form,
      bufferDays: Number(form.bufferDays),
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      spec: spec ?? undefined,
    };

    try {
      const url = isEdit ? `/api/equipment/${initialData.id}` : "/api/equipment";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrors(json.details ?? [json.error ?? "Wystąpił błąd"]);
        setSubmitting(false);
        return;
      }

      router.push(`/equipment/${json.data.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrors(["Nie udało się połączyć z serwerem"]);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? "Edytuj sprzęt" : "Dodaj nowy sprzęt"}
      </h1>

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <ul className="list-inside list-disc">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <Field label="Nazwa">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleFieldChange}
          required
          className="input"
        />
      </Field>

      <Field label="Opis">
        <textarea
          name="description"
          value={form.description}
          onChange={handleFieldChange}
          rows={3}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kategoria">
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            name="status"
            value={form.status}
            onChange={handleFieldChange}
            className="input"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Bufor przygotowania (dni)">
          <input
            type="number"
            name="bufferDays"
            min={0}
            value={form.bufferDays}
            onChange={handleFieldChange}
            className="input"
          />
        </Field>

        <Field label="URL zdjęcia">
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleFieldChange}
            className="input"
          />
        </Field>
      </div>

      <SpecFields category={form.category} spec={spec} onChange={handleSpecChange} />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Dodaj sprzęt"}
      </button>
    </form>
  );
}

function SpecFields({ category, spec, onChange }) {
  if (!spec) return null;

  const labelsByField = {
    manufacturer: "Producent",
    cpu: "CPU",
    ram: "RAM",
    storage: "Pamięć",
    os: "System operacyjny",
    model: "Model",
    imei: "IMEI",
    sensorType: "Typ sensora",
    resolution: "Rozdzielczość",
    lensMount: "Mocowanie obiektywu",
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Specyfikacja ({category})
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(spec).map((field) => (
          <Field key={field} label={labelsByField[field] ?? field}>
            <input
              type="text"
              name={field}
              value={spec[field] ?? ""}
              onChange={onChange}
              className="input"
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}