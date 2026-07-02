export function uuidSchema(example = '9d2b4b4e-5f71-4d7f-94b8-8f43a8b3c8c2') {
  return {
    type: 'string',
    format: 'uuid',
    example,
  };
}

export function dateTimeSchema(example = '2026-06-26T10:00:00.000Z') {
  return {
    type: 'string',
    format: 'date-time',
    example,
  };
}
