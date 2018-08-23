import * as _ from 'lodash'

import { QueryableObject } from './query'

interface MaxProjection {
  max: string
}

interface SumProjection {
  sum: string
}

interface UniqProjection {
  uniq: string
}

interface AliasProjection {
  [key: string]: { as: string }
}
// Note: we can use the keyof instead of just a plain string
export type ProjectionDefinition =
  string[]
  | AliasProjection
  | MaxProjection
  | SumProjection
  | UniqProjection

function isMaxProjection (projection: ProjectionDefinition): projection is MaxProjection {
  return !!(projection as MaxProjection).max
}

function isSumProjection (projection: ProjectionDefinition): projection is SumProjection {
  return !!(projection as SumProjection).sum
}

function isUniqProjection (projection: ProjectionDefinition): projection is UniqProjection {
  return !!(projection as UniqProjection).uniq
}

// Note: add a generic type to the QueryableObject
export default function project (items: QueryableObject[], projections?: ProjectionDefinition): {[key: string]: any} {
  if (!projections) {
    return items
  }

  if (Array.isArray(projections)) {
    return items.map((item: any) => _.pick(item, projections))
  }

  if (isMaxProjection(projections)) {
    const col = projections.max
    const max: { [key: string]: any } = _.sortBy(items, [col])[items.length - 1]

    return { max: max[col] }
  }

  if (isSumProjection(projections)) {
    const col = projections.sum
    const sum = _.sumBy(items, col)

    return { sum }
  }

  if (isUniqProjection(projections)) {
    const col = projections.uniq
    const values = _.uniq(items.map((i: QueryableObject) => i[col]))

    return values.map(value => ({ [col]: value }))
  }

  const columns = Object.keys(projections)[0]
  const as = projections[columns].as

  return items.map((item: QueryableObject) => {
    const clone = { [as]: item[columns] }

    return clone
  })
}
