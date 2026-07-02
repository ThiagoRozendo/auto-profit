export function uuidSchema(example = '11111111-1111-1111-1111-111111111111') {
  return {
    type: 'string',
    format: 'uuid',
    example,
  };
}

export function dateTimeSchema(example = '2026-06-25T10:00:00.000Z') {
  return {
    type: 'string',
    format: 'date-time',
    example,
  };
}

export function decimalSchema(example = 1800) {
  return {
    type: 'number',
    format: 'decimal',
    example,
  };
}
