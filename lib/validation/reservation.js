export function validateReservationInput(body) {
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
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      if (startDate < todayStart) {
        errors.push('Data rozpoczęcia ("startDate") nie może być w przeszłości');
      }
  
      if (endDate < startDate) {
        errors.push('Data zakończenia ("endDate") nie może być wcześniejsza niż data rozpoczęcia');
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