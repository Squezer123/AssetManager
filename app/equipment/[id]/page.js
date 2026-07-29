import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import { withMinDelay } from "../../../lib/withMinDelay.js";

export default async function EquipmentDetails({ params }) {
  const { id } = await params;

  const equipment = await withMinDelay(
    prisma.equipment.findUnique({
      where: { id },
      include: {
        laptopSpec: true,
        phoneSpec: true,
        cameraSpec: true,
        reservations: {
          orderBy: { startDate: "desc" },
        },
      },
    })
  );

  if (!equipment) {
    notFound();
  }

  const today = new Date();
  const activeReservation = equipment.reservations.find(
    (r) =>
      r.status === "ACTIVE" &&
      new Date(r.startDate) <= today &&
      new Date(r.endDate) >= today
  );

  const availabilityLabel =
    equipment.status === "MAINTENANCE"
      ? "Maintenance"
      : equipment.status === "RETIRED"
      ? "Retired"
      : activeReservation
      ? "Rented"
      : "Available";

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href={`/equipment`}
          className={`mt-1 inline-block rounded-lg px-6 py-3 text-white bg-blue-600 hover:bg-blue-700`}
        >
          Back to equipment
        </Link>

        <div className="mt-8 grid gap-10 rounded-xl bg-white p-8 shadow md:grid-cols-2">
          {equipment.imageUrl ? (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="h-96 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-96 items-center justify-center rounded-xl bg-slate-200">
              <div className="text-center text-slate-500">
                <div className="text-6xl">📦</div>
                <p className="mt-3">Brak zdjęcia</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-4xl font-bold text-slate-900">
              {equipment.name}
            </h2>

            <p className="mt-3 text-slate-600">
              {equipment.description || "Corporate device used for company operations."}
            </p>

            <div className="mt-8 space-y-5">
              <Info label="Category" value={equipment.category} />

              <Info
                label="Preparation buffer"
                value={`${equipment.bufferDays} day(s) after return`}
              />

              {activeReservation && (
                <Info
                  label="Currently rented until"
                  value={new Date(activeReservation.endDate).toLocaleDateString()}
                />
              )}

              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <span
                  className={`inline-block rounded-full px-4 py-2 text-sm ${
                    availabilityLabel === "Available"
                      ? "bg-green-100 text-green-700"
                      : availabilityLabel === "Rented"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {availabilityLabel}
                </span>
              </div>
            </div>

            <SpecSection category={equipment.category} equipment={equipment} />

            <Link
              href={`/equipment/${equipment.id}/reserve`}
              className={`mt-8 inline-block rounded-lg px-6 py-3 text-white ${
                availabilityLabel === "Available"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "pointer-events-none bg-gray-300"
              }`}
            >
              Reserve equipment
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-white p-8 shadow">
          <h3 className="text-2xl font-semibold">Reservation history</h3>

          {equipment.reservations.length === 0 ? (
            <p className="mt-4 text-slate-600">No reservations yet.</p>
          ) : (
            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.reservations.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-3">
                      {new Date(r.startDate).toLocaleDateString()}
                    </td>
                    <td>{new Date(r.endDate).toLocaleDateString()}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

function SpecSection({ category, equipment }) {
  if (category === "LAPTOP" && equipment.laptopSpec) {
    const s = equipment.laptopSpec;
    return (
      <div className="mt-8 space-y-5 border-t pt-8">
        <Info label="Manufacturer" value={s.manufacturer} />
        <Info label="CPU" value={s.cpu} />
        <Info label="RAM" value={s.ram} />
        <Info label="Storage" value={s.storage} />
        <Info label="Operating System" value={s.os} />
      </div>
    );
  }

  if (category === "PHONE" && equipment.phoneSpec) {
    const s = equipment.phoneSpec;
    return (
      <div className="mt-8 space-y-5 border-t pt-8">
        <Info label="Manufacturer" value={s.manufacturer} />
        <Info label="Model" value={s.model} />
        <Info label="Storage" value={s.storage} />
        <Info label="Operating System" value={s.os} />
        <Info label="IMEI" value={s.imei || "—"} />
      </div>
    );
  }

  if (category === "CAMERA" && equipment.cameraSpec) {
    const s = equipment.cameraSpec;
    return (
      <div className="mt-8 space-y-5 border-t pt-8">
        <Info label="Manufacturer" value={s.manufacturer} />
        <Info label="Sensor type" value={s.sensorType || "—"} />
        <Info label="Resolution" value={s.resolution || "—"} />
        <Info label="Lens mount" value={s.lensMount || "—"} />
      </div>
    );
  }

  return null;
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}