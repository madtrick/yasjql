import * as  _ from 'lodash';

function c (conditions) {
  let ordering = ['asc'];
  let by;

  if (_.isString(conditions)) {
    by = conditions;
  }

  if (_.isPlainObject(conditions)) {
    by = Object.keys(conditions)[0];
    ordering = [conditions[by]];
  }

  return { by, ordering };
}

const ORDERINGS = {
  orderBy: function by (items, conditions) {
    if (!conditions) {
      return items;
    }

    const order = c(conditions);

    return _.orderBy(items, el => _.at(el, order.by), order.ordering);
  },

  orderGroupsBy: function groupBy (groups, condition) {
    if (!condition) {
      return groups;
    }

    const order = c(condition);

    if (order.by.split('.').length > 1) {
      const element = order.by.split('.')[1];

      return _.orderBy(groups, group => group.projection[element], order.ordering);
    }

    return ORDERINGS.orderBy(groups, 'key');
  },
};

export default ORDERINGS
