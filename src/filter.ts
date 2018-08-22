// import * as _ from 'lodash';

// function sameTypeOperands (a, b) {
//   return typeof a === typeof b;
// }

// function numericalOperands (a, b) {
//   return _.isNumber(a) && _.isNumber(b);
// }

// function dateOperands (a, b) {
//   return _.isDate(a) && _.isDate(b);
// }

// const FILTERS = {
//   gt: function gt (a, b) {
//     if (
//       !sameTypeOperands(a, b) || !(
//         numericalOperands(a, b) || dateOperands(a, b))
//     ) {
//       throw new Error('Incompatible types in operands');
//     }

//     return a > b;
//   },

//   lt: function lt (a, b) {
//     if (
//       !sameTypeOperands(a, b) || !(
//         numericalOperands(a, b) || dateOperands(a, b))
//     ) {
//       throw new Error('Incompatible types in operands');
//     }

//     return a < b;
//   },

//   eq: function eq (a, b) {
//     return a === b;
//   },

//   in: function inclusion (a, b) {
//     return _.includes(b, a);
//   },

//   nin: function nin (a, b) {
//     return !_.includes(b, a);
//   },

//   match: function match (a, b) {
//     let expr;

//     if (_.isRegExp(b)) {
//       expr = b;
//     } else {
//       expr = new RegExp(b, 'i');
//     }

//     return a.match(expr);
//   },
// };

// function andConstraints (value, constraints) {
//   const constraintsIds = Object.keys(constraints);

//   return constraintsIds.reduce((valid, constraintId) => {
//     const filter = FILTERS[constraintId];
//     const b = constraints[constraintId];

//     return valid && filter(value, b);
//   }, true);
// }

// function orConstraints (value, constraints) {
//   return constraints.reduce((valid, constraintGroup) => valid || andConstraints(value, constraintGroup)
//   , false);
// }

// function applyFilters (filter, item) {
//   return Object.keys(filter).reduce((valid, column) => {
//     const value = item[column];
//     const constraints = filter[column];

//     if (Array.isArray(constraints)) {
//       return valid && orConstraints(value, constraints);
//     }

//     return valid && andConstraints(value, constraints);
//   }, true);
// }

// function orFilters (filtersArray, items) {
//   return items.filter(item => filtersArray.find(filters => applyFilters(filters, item)));
// }

// export default function filter (filters, items) {
//   if (Array.isArray(filters)) {
//     return orFilters(filters, items);
//   }

//   return items.filter(item => applyFilters(filters || {}, item));
// };
