import * as _ from 'lodash'

interface MaxProjection<T> {
  max: keyof T
}

interface SumProjection<T> {
  sum: Extract<keyof T, string>
}

interface UniqProjection<T> {
  uniq: Extract<keyof T, string>
}

interface AliasProjection<T> {
  alias: { [key in keyof T]?: string }
}

export type ProjectionDefinition<T> =
  (keyof T)[]
  | MaxProjection<T>
  | SumProjection<T>
  | UniqProjection<T>
  | AliasProjection<T>

function isMaxProjection<T> (projection: ProjectionDefinition<T>): projection is MaxProjection<T> {
  return !!(projection as MaxProjection<T>).max
}

function isSumProjection<T> (projection: ProjectionDefinition<T>): projection is SumProjection<T> {
  return !!(projection as SumProjection<T>).sum
}

function isUniqProjection<T> (projection: ProjectionDefinition<T>): projection is UniqProjection<T> {
  return !!(projection as UniqProjection<T>).uniq
}

export default function project<T extends { [key: string]: any }> (items: T[], projections?: ProjectionDefinition<T>): {[key: string]: any} {
  if (!projections) {
    return items
  }

  if (Array.isArray(projections)) {
    return items.map((item: any) => _.pick(item, projections))
  }

  if (isMaxProjection(projections)) {
    const col = projections.max
    const max: T = _.sortBy(items, [col])[items.length - 1]

    return { max: max[col] }
  }

  if (isSumProjection(projections)) {
    const col = projections.sum
    const sum = _.sumBy(items, col)

    return { sum }
  }

  if (isUniqProjection(projections)) {
    const col = projections.uniq
    const values = _.uniq(items.map((i: T) => i[col]))

    return values.map(value => ({ [col]: value }))
  }

  const aliases = projections.alias
  const toAliasKeys = Object.keys(aliases)

  return items.map((item: T) => {
    // Note: can we improve the type of "mapped"?
    return toAliasKeys.reduce((mapped: { [key: string]: any }, toAliasKey) => {
      const newKey = aliases[toAliasKey]
      mapped[newKey!] = item[toAliasKey]

      return mapped
    }, {})
  })
}
