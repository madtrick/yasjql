import { sortBy, sumBy, pick, uniq } from 'lodash'

interface MaxProjection<T> {
  max: keyof T
}

interface SumProjection<T> {
  sum: Extract<keyof T, string>
}

interface UniqProjection<T> {
  uniq: Extract<keyof T, string>
}

// interface AliasProjection<T> {
//   alias: { [key in keyof T]?: string }
// }

type KeysProjection<T> = (keyof T)[]
export type ProjectionDefinition<T> =
  KeysProjection<T>
  | MaxProjection<T>
  | SumProjection<T>
  | UniqProjection<T>

export function isMaxProjection<T> (projection: ProjectionDefinition<T>): projection is MaxProjection<T> {
  return !!(projection as MaxProjection<T>).max
}

export function isSumProjection<T> (projection: ProjectionDefinition<T>): projection is SumProjection<T> {
  return !!(projection as SumProjection<T>).sum
}

function isUniqProjection<T> (projection: ProjectionDefinition<T>): projection is UniqProjection<T> {
  return !!(projection as UniqProjection<T>).uniq
}

// NOTE: it's weird that I've some types are an array and others not
export type Projected<T, P> =
  P extends undefined ? T[]:
  P extends KeysProjection<T> ? Pick<T, keyof T>[]:
  P extends MaxProjection<T> ? { max: number } :
  P extends SumProjection<T> ? { sum: number } :
  P extends UniqProjection<T> ? Pick<T, keyof T>[] :
  never

export default function project<T extends { [key: string]: any }> (items: T[], projections?: ProjectionDefinition<T>): Projected<T, ProjectionDefinition<T>> {
  if (projections === undefined) {
    return items
  }

  if (Array.isArray(projections)) {
    return items.map((item: T) => pick(item, projections))
  }

  if (isMaxProjection(projections)) {
    const col = projections.max
    const max: T = sortBy(items, [col])[items.length - 1]

    return { max: max[col] }
  }

  if (isSumProjection(projections)) {
    const col = projections.sum
    const sum = sumBy(items, col)

    return { sum }
  }

  if (isUniqProjection(projections)) {
    const col = projections.uniq
    const values: T[Extract<keyof T, string>] = uniq(items.map((item: T) => item[col]))

    return values.map((value: T[Extract<keyof T, string>]) => ({ [col]: value }))
  }

  throw Error('Unknown projection')

  // const aliases = projections.alias
  // const toAliasKeys = Object.keys(aliases)

  // return items.map((item: T) => {
  //   // Note: can we improve the type of "mapped"?
  //   return toAliasKeys.reduce((mapped: { [key: string]: any }, toAliasKey) => {
  //     const newKey = aliases[toAliasKey]
  //     mapped[newKey!] = item[toAliasKey]

  //     return mapped
  //   }, {})
  // })
}
