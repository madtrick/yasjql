import { at, isString, isPlainObject, orderBy } from 'lodash'

function c<T> (condition: OrderCondition<T>): { by: Extract<keyof T, string>, direction: OrderDirection } {
  let direction: OrderDirection
  let by: Extract<keyof T, string>

  // Note: had to add the `typeof` check as otherwise TS won't consider
  // "condition" as a string inside the "if"
  if (isString(condition) && typeof condition === 'string') {
    by = condition
    direction = 'asc'
  }

  // Note: maybe throw if more than one one key present in the object
  // Note: had to add the `typeof` check as otherwise TS won't consider
  // "condition" as an object inside the "if"
  if (isPlainObject(condition) && typeof condition === 'object') {
    by = Object.keys(condition)[0] as Extract<keyof T, string>
    direction = condition[by]
  }

  return { by, direction }
}

// Note: can we restrict the number of properties in the object
// i.e. avoid having { foo: 'desc', bar: 'asc' }
export type OrderCondition<T> = Extract<keyof T, string> | { [key in Extract<keyof T, string>]: OrderDirection }
type OrderDirection = 'asc' | 'desc'

const ORDERINGS = {
  orderBy: function by<T extends object> (items: T[], condition: OrderCondition<T>): T[] {
    const order = c(condition)

    return orderBy(items, item => at(item, [order.by]), [order.direction])
  }

  // orderGroupsBy: function groupBy (groups, condition) {
  //   if (!condition) {
  //     return groups
  //   }

  //   const order = c(condition)

  //   if (order.by.split('.').length > 1) {
  //     const element = order.by.split('.')[1]

  //     return _.orderBy(groups, group => group.projection[element], order.ordering)
  //   }

  //   return ORDERINGS.orderBy(groups, 'key')
  // }
}

export default ORDERINGS
