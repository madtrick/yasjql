'use strict';

const _ = require('lodash');

function sameTypeOperands (a, b) {
  return typeof a === typeof b;
}

function numericalOperands (a, b) {
  return _.isNumber(a) && _.isNumber(b);
}

function dateOperands (a, b) {
  return _.isDate(a) && _.isDate(b);
}

const filters = {
  gt: function gt (a, b) {
    if (
      !sameTypeOperands(a, b) || !(
        numericalOperands(a, b) || dateOperands(a, b))
    ) {
      throw new Error('Incompatible types in operands');
    }

    return a > b;
  },

  lt: function lt (a, b) {
    if (
      !sameTypeOperands(a, b) || !(
        numericalOperands(a, b) || dateOperands(a, b))
    ) {
      throw new Error('Incompatible types in operands');
    }

    return a < b;
  },

  eq: function eq (a, b) {
    return a === b;
  },

  in: function inclusion (a, b) {
    return _.includes(b, a);
  },

  nin: function nin (a, b) {
    return !_.includes(b, a);
  },

  match: function match (a, b) {
    let expr;

    if (_.isRegExp(b)) {
      expr = b;
    } else {
      expr = new RegExp(b, 'i');
    }

    return a.match(expr);
  },
};

function isValueValid (value, constraints) {
  const constraintsIds = Object.keys(constraints);

  return constraintsIds.reduce((valid, constraintId) => {
    const filter = filters[constraintId];
    const b = constraints[constraintId];

    return valid && filter(value, b);
  }, true);
}

function applyColumnConstraints (column, constraints, items) {
  return items.filter(item => isValueValid(item[column], constraints));
}

module.exports = function filter (constraints, items) {
  return Object.keys(constraints || {}).reduce((acc, column) => {
    const columnConstraints = constraints[column];

    return applyColumnConstraints(column, columnConstraints, acc);
  }, items);
};
