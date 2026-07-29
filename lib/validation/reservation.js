const BUSINESS_HOUR_START = 8;
const BUSINESS_HOUR_END = 18;

export function validateDailyReservationInput(body) {
  const errors = [];
  const data = {};

  if (typeof body.equipmentId !== "string" || body.equipmentId.trim().length === 0) {
    errors.push('Pole "equipmentId" jest wymagane');
  } else {
    data.equipmentId = body.equipmentId;
  }

  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;

  if (!body.startDate || isNaN(startDate?.getTime())) {
    errors.push('Pole "startDate" jest wymagane i musi być poprawną datą');
  }
  if (!body.endDate || isNaN(endDate?.getTime())) {
    errors.push('Pole "endDate" jest wymagane i musi być poprawną datą');
  }

  if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (startDate < todayStart) {
      errors.push('Data rozpoczęcia nie może być w przeszłości');
    }
    if (endDate < startDate) {
      errors.push('Data zakończenia nie może być wcześniejsza niż data rozpoczęcia');
    }

    const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      errors.push('Rezerwacja nie może przekraczać 30 dni');
    }

    data.startDate = startDate;
    data.endDate = endDate;
  }

  return { data, errors };
}

export function validateHourlyReservationInput(body) {
  const errors = [];
  const data = {};

  if (typeof body.equipmentId !== "string" || body.equipmentId.trim().length === 0) {
    errors.push('Pole "equipmentId" jest wymagane');
  } else {
    data.equipmentId = body.equipmentId;
  }

  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;

  if (!body.startDate || isNaN(startDate?.getTime())) {
    errors.push('Pole "startDate" jest wymagane i musi być poprawną datą');
  }
  if (!body.endDate || isNaN(endDate?.getTime())) {
    errors.push('Pole "endDate" jest wymagane i musi być poprawną datą');
  }

  if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
    const now = new Date();

    if (startDate < now) {
      errors.push('Wybrany termin jest w przeszłości');
    }

    if (endDate <= startDate) {
      errors.push('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia');
    }

    const sameDay =
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate();

    if (!sameDay) {
      errors.push('Rezerwacja godzinowa musi mieścić się w obrębie jednego dnia');
    }

    const isWholeHour = (d) => d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0;

    if (!isWholeHour(startDate) || !isWholeHour(endDate)) {
      errors.push('Godziny rezerwacji muszą zaczynać się o pełnej godzinie');
    }

    if (
      startDate.getHours() < BUSINESS_HOUR_START ||
      endDate.getHours() > BUSINESS_HOUR_END ||
      (endDate.getHours() === BUSINESS_HOUR_END && endDate.getMinutes() > 0)
    ) {
      errors.push(
        `Rezerwacja musi mieścić się w godzinach ${BUSINESS_HOUR_START}:00-${BUSINESS_HOUR_END}:00`
      );
    }

    const diffHours = (endDate - startDate) / (1000 * 60 * 60);
    if (diffHours < 1) {
      errors.push('Minimalny czas rezerwacji to 1 godzina');
    }

    data.startDate = startDate;
    data.endDate = endDate;
  }

  return { data, errors };
}

export const BUSINESS_HOURS = { start: BUSINESS_HOUR_START, end: BUSINESS_HOUR_END };