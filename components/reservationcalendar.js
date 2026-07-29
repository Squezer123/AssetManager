"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const BUSINESS_HOUR_START = 8;
const BUSINESS_HOUR_END = 18;
const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const DAY_NAMES = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function ReservationCalendar({
  equipment,
  mode = "create",       
  existingReservation = null, 
}) {
  const router = useRouter();
  const isHourlyMode = equipment.bufferDays === 0;
  const isEdit = mode === "edit" && existingReservation;

  const now = new Date();
  const hasStarted = isEdit && new Date(existingReservation.startDate) <= now;

  const excludeSelf = (list) =>
    isEdit ? list.filter((r) => r.id !== existingReservation.id) : list;

  const [reservations, setReservations] = useState(
    excludeSelf(equipment.reservations ?? [])
  );
  const [currentMonth, setCurrentMonth] = useState(
    isEdit ? startOfDay(existingReservation.startDate) : startOfDay(new Date())
  );

  // Stan wstępnie wypełniony danymi edytowanej rezerwacji
  const [selectedDay, setSelectedDay] = useState(
    isEdit
      ? isHourlyMode
        ? startOfDay(existingReservation.startDate).getTime()
        : startOfDay(existingReservation.endDate).getTime()
      : null
  );
  const [rangeStart, setRangeStart] = useState(
    isEdit && !isHourlyMode ? startOfDay(existingReservation.startDate).getTime() : null
  );

  const [hourRangeStart, setHourRangeStart] = useState(
    isEdit && isHourlyMode ? new Date(existingReservation.startDate).getHours() : null
  );
  const [hourRangeEnd, setHourRangeEnd] = useState(
    isEdit && isHourlyMode ? new Date(existingReservation.endDate).getHours() - 1 : null
  );

  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/equipment/${equipment.id}/availability`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.reservations) {
          setReservations(excludeSelf(json.data.reservations));
        }
      })
      .catch(() => {});
  }, [equipment.id, currentMonth]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [currentMonth]);

  function isDayFullyBooked(day) {
    if (!day) return false;
    const dayStart = startOfDay(day);

    if (dayStart < today) return true;

    if (isEdit && hasStarted && !isHourlyMode) {
      if (dayStart < startOfDay(existingReservation.endDate)) return true;
    }

    if (isHourlyMode) {
      for (let h = BUSINESS_HOUR_START; h < BUSINESS_HOUR_END; h++) {
        if (!isHourTaken(day, h)) return false;
      }
      return true;
    }

    const bufferMs = equipment.bufferDays * 24 * 60 * 60 * 1000;
    return reservations.some((r) => {
      const rStart = new Date(new Date(r.startDate).getTime() - bufferMs);
      const rEnd = new Date(new Date(r.endDate).getTime() + bufferMs);
      return dayStart >= startOfDay(rStart) && dayStart <= startOfDay(rEnd);
    });
  }

  function isHourTaken(day, hour) {
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(day);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return reservations.some((r) => {
      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      return rStart < slotEnd && rEnd > slotStart;
    });
  }

  function isHourLockedForExtendOnly(hour) {
    if (!(isEdit && hasStarted && isHourlyMode)) return false;
    const originalEndHour = new Date(existingReservation.endDate).getHours() - 1;
    return hour < originalEndHour;
  }

  function isDayInSelectedRange(day) {
    if (isHourlyMode || !rangeStart || !selectedDay) return false;
    const d = startOfDay(day).getTime();
    return d >= Math.min(rangeStart, selectedDay) && d <= Math.max(rangeStart, selectedDay);
  }

  function isHourInSelectedRange(hour) {
    if (hourRangeStart == null || hourRangeEnd == null) return false;
    return hour >= Math.min(hourRangeStart, hourRangeEnd) && hour <= Math.max(hourRangeStart, hourRangeEnd);
  }

  function handleDayClick(day) {
    if (!day || isDayFullyBooked(day)) return;
    setErrors([]);

    if (isHourlyMode) {
      if (isEdit && hasStarted) return;
      setSelectedDay(startOfDay(day).getTime());
      setHourRangeStart(null);
      setHourRangeEnd(null);
      return;
    }

    if (isEdit && hasStarted) {
      setSelectedDay(startOfDay(day).getTime());
      return;
    }

    if (!rangeStart) {
      setRangeStart(startOfDay(day).getTime());
      setSelectedDay(startOfDay(day).getTime());
    } else {
      setSelectedDay(startOfDay(day).getTime());
    }
  }

  function handleHourClick(hour) {
    if (isHourTaken(new Date(selectedDay), hour)) return;
    if (isHourLockedForExtendOnly(hour)) return;
    setErrors([]);

    if (isEdit && hasStarted) {
      setHourRangeEnd(hour);
      return;
    }

    if (hourRangeStart == null) {
      setHourRangeStart(hour);
      setHourRangeEnd(hour);
    } else {
      setHourRangeEnd(hour);
    }
  }

  async function submitReservation(startDate, endDate) {
    setSubmitting(true);
    setErrors([]);

    try {
      const url = isEdit ? `/api/reservations/${existingReservation.id}` : "/api/reservations";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { action: "edit", startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        : { equipmentId: equipment.id, startDate: startDate.toISOString(), endDate: endDate.toISOString() };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrors(json.details ?? [json.error ?? "Wystąpił błąd"]);
        setSubmitting(false);
        return;
      }

      router.push(isEdit ? "/" : `/equipment/${equipment.id}`);
      router.refresh();
    } catch {
      setErrors(["Nie udało się połączyć z serwerem"]);
      setSubmitting(false);
    }
  }

  function confirmDailyReservation() {
    if (!rangeStart || !selectedDay) return;
    const start = new Date(Math.min(rangeStart, selectedDay));
    const end = new Date(Math.max(rangeStart, selectedDay));
    submitReservation(start, end);
  }

  function confirmHourlyReservation() {
    if (hourRangeStart == null || hourRangeEnd == null || !selectedDay) return;

    const startHour = Math.min(hourRangeStart, hourRangeEnd);
    const endHour = Math.max(hourRangeStart, hourRangeEnd);

    for (let h = startHour; h <= endHour; h++) {
      if (isHourTaken(new Date(selectedDay), h)) {
        setErrors(["Wybrany zakres zawiera już zajętą godzinę — zmień wybór."]);
        return;
      }
    }

    const start = new Date(selectedDay);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(selectedDay);
    end.setHours(endHour + 1, 0, 0, 0);
    submitReservation(start, end);
  }

  function changeMonth(delta) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    if (!isEdit) {
      setSelectedDay(null);
      setRangeStart(null);
      setHourRangeStart(null);
      setHourRangeEnd(null);
    }
  }

  return (
    <div className="space-y-6">
      {isEdit && hasStarted && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Ta rezerwacja już się rozpoczęła — możesz ją tylko przedłużyć, nie skrócić ani zmienić daty startu.
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <ul className="list-inside list-disc">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          >
            ←
          </button>
          <h2 className="font-semibold text-slate-900">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;

            const booked = isDayFullyBooked(day);
            const isSelected =
              selectedDay === startOfDay(day).getTime() ||
              isDayInSelectedRange(day);

            return (
              <button
                key={i}
                type="button"
                disabled={booked}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg text-sm transition-colors ${
                  booked
                    ? "cursor-not-allowed bg-slate-100 text-slate-300"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-blue-50"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {isHourlyMode && selectedDay && (
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-1 font-semibold text-slate-900">
            Wybierz godziny — {new Date(selectedDay).toLocaleDateString()}
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            {isEdit && hasStarted
              ? "Kliknij godzinę, do której chcesz przedłużyć rezerwację."
              : "Kliknij godzinę początkową, a potem końcową (można wybrać tylko jedną — minimum to 1 godzina)."}
          </p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from(
              { length: BUSINESS_HOUR_END - BUSINESS_HOUR_START },
              (_, i) => BUSINESS_HOUR_START + i
            ).map((hour) => {
              const taken = isHourTaken(new Date(selectedDay), hour);
              const locked = isHourLockedForExtendOnly(hour);
              const inRange = isHourInSelectedRange(hour);
              return (
                <button
                  key={hour}
                  type="button"
                  disabled={taken || locked}
                  onClick={() => handleHourClick(hour)}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    taken || locked
                      ? "cursor-not-allowed bg-slate-100 text-slate-300"
                      : inRange
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {String(hour).padStart(2, "0")}:00
                </button>
              );
            })}
          </div>

          {hourRangeStart != null && hourRangeEnd != null && (
            <div className="mt-5 border-t pt-5">
              <p className="text-sm text-slate-600">
                Wybrany zakres: {String(Math.min(hourRangeStart, hourRangeEnd)).padStart(2, "0")}:00
                {" — "}
                {String(Math.max(hourRangeStart, hourRangeEnd) + 1).padStart(2, "0")}:00
                {" "}
                ({Math.max(hourRangeStart, hourRangeEnd) - Math.min(hourRangeStart, hourRangeEnd) + 1}h)
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={confirmHourlyReservation}
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Potwierdź rezerwację"}
                </button>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setHourRangeStart(null);
                      setHourRangeEnd(null);
                    }}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 hover:bg-slate-50"
                  >
                    Wyczyść
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!isHourlyMode && rangeStart && selectedDay && (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">
            Wybrany zakres: {new Date(Math.min(rangeStart, selectedDay)).toLocaleDateString()}
            {" — "}
            {new Date(Math.max(rangeStart, selectedDay)).toLocaleDateString()}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={confirmDailyReservation}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Potwierdź rezerwację"}
            </button>
            {!isEdit && (
              <button
                type="button"
                onClick={() => {
                  setRangeStart(null);
                  setSelectedDay(null);
                }}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 hover:bg-slate-50"
              >
                Wyczyść
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-slate-500">
        {isHourlyMode
          ? "Ten sprzęt można rezerwować godzinowo (minimum 1 godzina), bez przerwy na przygotowanie."
          : `Ten sprzęt wymaga ${equipment.bufferDays} dni przerwy na przygotowanie po zwrocie.`}
      </p>
    </div>
  );
}