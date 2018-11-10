import { isRegExp } from 'lodash'

const STRING_FILTERS = {
  match: (itemValue: string, constraintValue: string | RegExp | undefined): boolean => {
    if (!constraintValue) {
      return true
    }

    let expr

    if (isRegExp(constraintValue)) {
      expr = constraintValue
    } else {
      expr = new RegExp(constraintValue, 'i')
    }

    return itemValue.match(expr) !== null
  },

  eq: function eq (itemValue: string, constraintValue: string): boolean {
    return itemValue === constraintValue
  }
}

const NUMBER_FILTERS = {
  // TODO: falta "in" para strings
  in: function inclusion (itemValue: number, constraintValue: number[]): boolean {
    return constraintValue.includes(itemValue)
  },

  nin: function notInclusion (itemValue: number, constraintValue: number[]): boolean {
    return !constraintValue.includes(itemValue)
  },

  eq: function equality (itemValue: number, constraintValue: number): boolean {
    return itemValue === constraintValue
  },

  gt: function gt (itemValue: number, constraintValue: number): boolean {
    return itemValue > constraintValue
  },

  lt: function lt (itemValue: number, constraintValue: number): boolean {
    return itemValue < constraintValue
  }
}

const DATE_FILTERS = {
  gt: function gt (itemValue: Date, constraintValue: Date): boolean {
    return itemValue > constraintValue
  },

  lt: function lt (itemValue: Date, constraintValue: Date): boolean {
    return itemValue < constraintValue
  }
}

type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

interface StringConstraint {
  match: string | RegExp
  eq: string
}

interface NumberConstraint {
  in: number[]
  nin: number[]
  eq: number
  gt: number
  lt: number
}

interface DateConstraints {
  lt: Date
  gt: Date
}

type ToConstraintType<T> =
  T extends string ? AtLeastOne<StringConstraint> :
  T extends number ? AtLeastOne<NumberConstraint> :
  T extends Date? AtLeastOne<DateConstraints> :
  void
export type Filter<T> = AtLeastOne<{ [K in keyof T]: ToConstraintType<T[K]> }>
type ValidValue = string | number | Date

export default function filter<T extends { [key: string]: ValidValue }> (filter: Filter<T>, items: T[]): T[] {
  if (!filter) {
    return items
  }

  //
  // Item: { foo: 1, bar: 2 }
  //
  // Filter: { foo: { gt: 1 } }
  // Filter: { foo: { match: /1/ } }
  //

  return items.filter((item: T) => {
    const propertiesToFilterOn = Object.keys(filter)

    return propertiesToFilterOn.every((property: string) => {
      const filterValue = filter[property]
      const value = item[property]

      if (typeof value === 'string') {
        const filterTypes = Object.keys(filterValue) as (keyof StringConstraint)[]
        return filterTypes.every((filterType) => {
          if (filterType === 'match') {
            const constraintValue = (filterValue as StringConstraint)[filterType]
            return STRING_FILTERS.match(value, constraintValue)
          }

          if (filterType === 'eq') {
            const constraintValue = (filterValue as StringConstraint)[filterType]
            return STRING_FILTERS.eq(value, constraintValue)
          }

          throw new Error(`Unsupported constraint ${filterType}`)
        })
      }

      if (typeof value === 'number') {
        const filterTypes = Object.keys(filterValue) as (keyof NumberConstraint)[]
        return filterTypes.every((filterType) => {
          if (filterType === 'eq' || filterType === 'gt' || filterType === 'lt') {
            // Note: need this if for the Type engine to work properly
            // due to the fact that constraintValue can be either be `number`
            // or `number[]`
            const constraintValue = (filterValue as NumberConstraint)[filterType]
            return NUMBER_FILTERS[filterType](value, constraintValue)
          }

          const constraintValue = (filterValue as NumberConstraint)[filterType]
          return NUMBER_FILTERS[filterType](value, constraintValue)
        })
      }

      if (value instanceof Date) {
        const filterTypes = Object.keys(filterValue) as (keyof DateConstraints)[]
        return filterTypes.every((filterType) => {
          const constraintValue = (filterValue as DateConstraints)[filterType]
          return DATE_FILTERS[filterType](value, constraintValue)
        })
      }

      throw new Error(`Unsupported value type "${typeof value}"`)
    })
  })
}
