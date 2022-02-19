export function clearDto(dtoInstance) {
  for (let property in dtoInstance) {
    if (dtoInstance[property] === null || dtoInstance[property] === undefined) {
      delete dtoInstance[property];
    }
  }
}