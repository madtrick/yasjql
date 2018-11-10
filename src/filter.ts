// import * as _ from 'lodash'

// // function sameTypeOperands (a: any, b: any): boolean {
// //   return typeof a === typeof b
// // }

// // function numericalOperands (a: any, b: any): boolean {
// //   return _.isNumber(a) && _.isNumber(b)
// // }

// // function dateOperands (a: any, b: any): boolean {
// //   return _.isDate(a) && _.isDate(b)
// // }


// // interface Filters {
// //   in: FilterImp<string | number, string[] | number[]>
// //   lt: FilterImp<number | Date, number | Date>
// //   eq: FilterImp<string | number, string | number>
// //   nin: FilterImp<string | number, string[] | number[]>
// //   gt: FilterImp<number | Date, number | Date>
// // }
// // interface StringFilters {
// //   match: FilterImp<string, string | RegExp>
// //   eq: FilterImp<string, string>
// //   nin: FilterImp<string, string[]>
// //   in: FilterImp<string, string[]>
// // }

// // interface NumberFilters {
// //   in: FilterImp<number, number[]>
// //   lt: FilterImp<number, number>
// //   eq: FilterImp<number, number>
// //   nin: FilterImp<number, number[]>
// //   gt: FilterImp<number, number>
// // }

// // interface DateFilters {
// //   lt: FilterImp<Date, Date>
// //   gt: FilterImp<Date, Date>
// // }


// // type Filters<T> =
// //   T extends string ? StringFilters :
// //   T extends number ? NumberFilters :
// //   T extends Date ? DateFilters :
// //   never


// // const FILTERS = {
// //   gt: function gt (a: number | Date, b: number | Date): boolean {
// //     // if (
// //     //   !sameTypeOperands(a, b) || !(
// //     //     numericalOperands(a, b) || dateOperands(a, b))
// //     // ) {
// //     //   throw new Error('Incompatible types in operands')
// //     // }

// //     return a > b
// //   },

// //   lt: function lt (a: number | Date, b: number | Date): boolean {
// //     // if (
// //     //   !sametypeoperands(a, b) || !(
// //     //     numericaloperands(a, b) || dateoperands(a, b))
// //     // ) {
// //     //   throw new error('incompatible types in operands');
// //     // }

// //     return a < b
// //   },

// //   eq: function eq (a: any, b: any): boolean {
// //     return a === b
// //   },

// //   in: function inclusion (a: string | number, b: string[] | number[]): boolean {
// //     return _.includes(b, a)
// //   },

// //   nin: function nin (a: string | number, b: string[] | number[]): boolean {
// //     return !_.includes(b, a)
// //   },

// //   match: function match (a: string, b: string | RegExp | undefined): boolean {
// //     if(!b)
// //     return true
// //     let expr

// //     if (_.isRegExp(b)) {
// //       expr = b
// //     } else {
// //       expr = new RegExp(b, 'i')
// //     }

// //     return a.match(expr) !== null
// //   }
// // }

// type ValidValue = string | number // | Date
// type FilterImp<V extends ValidValue, K extends keyof Constraint<V>> = (value2: V, constraintValue: Constraint<V>[K]) => boolean

// // function is<V, TType> (value: V, type: TType): value is TType & V {
// //   return typeof value === `${ type }`
// // }

// // type FiltersFor<V extends ValidValue> = {
// //   [K in keyof Constraint<V>]-?: FilterImp<V, K>
// // }

// type StringFilters = {
//   match: FilterImp<string, 'match'>,
//   // eq: FilterImp<string, 'eq'>,
//   // nin: FilterImp<string, 'nin'>,
//   in: FilterImp<string, 'in'>
// }
// const stringFilters: StringFilters = {
//   // match: (_value: string, _constraint: string | RegExp): boolean => true,
//   match: (a: string, b: string | RegExp | undefined): boolean => {
//     if (!b) {
//       return true
//     }

//     let expr

//     if (_.isRegExp(b)) {
//       expr = b
//     } else {
//       expr = new RegExp(b, 'i')
//     }

//     return a.match(expr) !== null
//   },
//   // eq: (_value: string, _constraint: string): boolean => true,
//   // nin: (_value: string, _constraint: string[]): boolean => true,
//   in: (_value: string, _constraint: string[]): boolean => true
// }

// function sf<K extends keyof StringFilters> (key: K): StringFilters[typeof key] {
//   return stringFilters[key]
// }

// function isString (value: ValidValue): value is string {
//   return typeof value === 'string'
// }

// function filterFor<V extends ValidValue, K extends keyof Constraint<V>> (value: V, name: K): FilterImp<V, typeof name> | undefined {
//   if (isString(value)) {
//     let f = value
//     let x = name as keyof Constraint<string>
//     return sf(x)
//   }
// }

// function andConstraints<V extends ValidValue> (value: V, constraints: Constraint<typeof value>): boolean {
//   const constraintsIds = Object.keys(constraints) as (keyof Constraint<typeof value>)[]

//   return constraintsIds.reduce((valid, constraintId) => {
//     const constraintValue = constraints[constraintId]
//     let filter = filterFor(value, constraintId)


//     return valid && filter(value, constraintValue)

//     // if (constraintId === 'match') {
//     //   const constraintValue = constraints.match!
//     //   return valid && FILTERS.match(value, constraintValue)
//     // }

//     // if (constraintId === 'in') {
//     //   const constraintValue = constraints.in!
//     //   return valid && FILTERS.in(value, constraintValue)
//     // }

//     // if (constraintId === 'nin') {
//     //   const constraintValue = constraints.nin!
//     //   return valid && FILTERS.nin(value, constraintValue)
//     // }

//     // if (constraintId === 'eq') {
//     //   const constraintValue = constraints.eq!
//     //   return valid && FILTERS.eq(value, constraintValue)
//     // }

//     // if (constraintId === 'lt') {
//     //   const constraintValue = constraints.lt!
//     //   return valid && FILTERS.lt(value, constraintValue)
//     // }

//     // if (constraintId === 'gt') {
//     //   const constraintValue = constraints.gt!
//     //   return valid && FILTERS.gt(value, constraintValue)
//     // }

//     // return false
//   }, true)
// }

// // function orConstraints (value, constraints: Filter) {
// //   return constraints.reduce(
// //     (valid: boolean, constraintGroup) => valid || andConstraints(value, constraintGroup)
// //   , false)
// // }

// function applyFilters<T extends {[key: string]: ValidValue}> (filter: Filter<T>, item: T): boolean {
//   const colums = Object.keys(filter) as (keyof T)[]
//   return colums.reduce((valid, column) => {
//     const value = item[column]
//     const constraints = filter[column]

//     if (!constraints) {
//       return false
//     }

//     // if (Array.isArray(constraints)) {
//     //   return valid && orConstraints(value, constraints)
//     // }

//     return valid && andConstraints(value, constraints)
//   }, true)
// }

// // function orFilters (filtersArray, items) {
// //   return items.filter(item => filtersArray.find(filters => applyFilters(filters, item)))
// // }
// //

// interface StringConstraints {
//   match: string | RegExp
//   in: string[]
//   // nin: string[]
//   // eq: string
// }

// interface NumberConstraints {
//   in: number[]
//   // nin: number[]
//   // eq: number
//   // lt: number
//   // gt: number
// }

// // interface DateConstraints {
// //   lt?: Date
// //   gt?: Date
// // }


// type Constraint<T extends ValidValue> =
//   T extends string ? StringConstraints :
//   T extends number ? NumberConstraints :
//   // T extends Date ? DateConstraints :
//   never

// // interface Constraint {
// //   match?: string | RegExp
// //   in?: string[] | number[]
// //   nin?: string[] | number[]
// //   eq?: string | number | boolean
// //   gt?: number | Date
// //   lt?: number | Date
// // }

// export type Filter<T extends {[key: string]: ValidValue}> = { [key in keyof T]?: Constraint<T[key]> }
// export default function filter<T extends {[key: string]: ValidValue}> (filter: Filter<T>, items: T[]): T[] {
//   // if (Array.isArray(filters)) {
//   //   return orFilters(filters, items)
//   // }
//   if (!filter) {
//     return items
//   }

//   return items.filter(item => applyFilters(filter, item))
// }
