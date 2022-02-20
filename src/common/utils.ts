import { getSchemaPath } from "@nestjs/swagger";

export function clearDto(dtoInstance) {
  for (let property in dtoInstance) {
    if (dtoInstance[property] === null || dtoInstance[property] === undefined) {
      delete dtoInstance[property];
    }
  }
}

export function listDtoToSchema<A, B>(listDto: new () => A, itemDto: new () => B) {
  return {
    allOf: [
      { $ref: getSchemaPath(listDto) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(itemDto) }
          }
        }
      }
    ]
  }
}