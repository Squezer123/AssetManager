const CATEGORIES = ['LAPTOP', 'PHONE', 'CAMERA', 'OTHER'];
const STATUSES = ['AVAILABLE', 'MAINTENANCE', 'RETIRED'];

export function validateEquipmentInput(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Pole "name" jest wymagane i musi być niepustym tekstem');
    } else if (body.name.length > 120) {
      errors.push('Pole "name" nie może przekraczać 120 znaków');
    } else {
      data.name = body.name.trim();
    }
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      errors.push('Pole "description" musi być tekstem');
    } else {
      data.description = body.description ?? null;
    }
  }

  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      errors.push(`Pole "category" musi być jednym z: ${CATEGORIES.join(', ')}`);
    } else {
      data.category = body.category;
    }
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      errors.push(`Pole "status" musi być jednym z: ${STATUSES.join(', ')}`);
    } else {
      data.status = body.status;
    }
  }

  if (body.bufferDays !== undefined) {
    const buffer = Number(body.bufferDays);
    if (!Number.isInteger(buffer) || buffer < 0) {
      errors.push('Pole "bufferDays" musi być nieujemną liczbą całkowitą');
    } else {
      data.bufferDays = buffer;
    }
  }

  if (body.imageUrl !== undefined) {
    if (body.imageUrl !== null && typeof body.imageUrl !== 'string') {
      errors.push('Pole "imageUrl" musi być tekstem (URL)');
    } else {
      data.imageUrl = body.imageUrl ?? null;
    }
  }

  return { data, errors };
}

export function validateSpecInput(category, spec) {
  if (!spec) return { data: null, errors: [] };

  const errors = [];
  const data = {};

  if (category === 'LAPTOP') {
    const required = ['manufacturer', 'cpu', 'ram', 'storage', 'os'];
    for (const field of required) {
      if (typeof spec[field] !== 'string' || spec[field].trim().length === 0) {
        errors.push(`laptopSpec.${field} jest wymagane`);
      } else {
        data[field] = spec[field].trim();
      }
    }
  } else if (category === 'PHONE') {
    const required = ['manufacturer', 'model', 'storage', 'os'];
    for (const field of required) {
      if (typeof spec[field] !== 'string' || spec[field].trim().length === 0) {
        errors.push(`phoneSpec.${field} jest wymagane`);
      } else {
        data[field] = spec[field].trim();
      }
    }
    if (spec.imei !== undefined) {
      data.imei = typeof spec.imei === 'string' ? spec.imei.trim() : null;
    }
  } else if (category === 'CAMERA') {
    if (typeof spec.manufacturer !== 'string' || spec.manufacturer.trim().length === 0) {
      errors.push('cameraSpec.manufacturer jest wymagane');
    } else {
      data.manufacturer = spec.manufacturer.trim();
    }
    for (const field of ['sensorType', 'resolution', 'lensMount']) {
      if (spec[field] !== undefined) {
        data[field] = typeof spec[field] === 'string' ? spec[field].trim() : null;
      }
    }
  }

  return { data, errors };
}