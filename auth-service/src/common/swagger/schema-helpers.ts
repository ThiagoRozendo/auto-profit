export function uuidSchema(example = '9d2b4b4e-5f71-4d7f-94b8-8f43a8b3c8c2') {
  return {
    type: 'string',
    format: 'uuid',
    example,
  };
}

export function dateTimeSchema(example = '2026-06-25T18:00:00.000Z') {
  return {
    type: 'string',
    format: 'date-time',
    example,
  };
}

export function emailSchema(example = 'joao.silva@example.com') {
  return {
    type: 'string',
    format: 'email',
    example,
  };
}
