import { getSchemaPath } from "@nestjs/swagger";
import { createHash } from "crypto";

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

export function hashPassword(password: string) {
  return createHash('sha256')
      .update(`${password}${process.env['PASSWORD_HASH_SALT']}`)
      .digest()
      .toString('hex');
}
