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

// type NumberFilters = {
//   in: (itemValue: number, constraintValue: number[]) => boolean
//   nin: (itemValue: number, constraintValue: number[]) => boolean
//   eq: (itemValue: number, constraintValue: number) => boolean
//   gt: (itemValue: number, constraintValue: number) => boolean
//   lt: (itemValue: number, constraintValue: number) => boolean
// }

// Typing the args with any so we can't the typing system to play ball
type NumberFilters = { [name in keyof NumberConstraint]: (itemValue: any, constraintValue: any) => boolean }
const NUMBER_FILTERS: NumberFilters = {
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

type FiltersFor<T extends ValidValue> = 
  T extends number ? NumberFilters : never

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

      // Fucking types, can't get this to work with proper types
      function andConstraints<K extends keyof T> (filterValue: any, item: T, key: K, filters: any): boolean {
        const itemValue = item[key]
        const filterKeys = Object.keys(filterValue)
        return filterKeys.every((filterKey) => {
          const constraintValue = filterValue[filterKey]
          const filter = filters[filterKey]
          return filter(itemValue, constraintValue)
        })
      }

      if (typeof value === 'string') {
        return andConstraints(filterValue, item, property, STRING_FILTERS)
      }

      if (typeof value === 'number') {
        return andConstraints(filterValue, item, property, NUMBER_FILTERS)
      }

      if (value instanceof Date) {
        return andConstraints(filterValue, item, property, DATE_FILTERS)
      }

      throw new Error(`Unsupported value type "${typeof value}"`)
    })
  })
}
