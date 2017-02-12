'use strict';

const _ = require('lodash');

const project = require('./project');
const filter = require('./filter');
const order = require('./order');


class GroupedCollection {
  constructor (groups) {
    this.groups = groups;
  }

  select (projections) {
    const wrappedGroups = this.groups.map(group =>
                              ({ key: group.key, projection: group.items.select(projections) }));
    const ordered = order.orderGroupsBy(wrappedGroups, this.orderBy);
    const orderedProjections = ordered.map(group => ({ [group.key]: group.projection }));

    return orderedProjections;
  }
}

class Collection {
  constructor (items) {
    this.items = items;
  }

  filter (filters) {
    this.items = filter(filters, this.items);

    return this;
  }

  select (projections) {
    return order.orderBy(project(this.items, projections), this.orderBy);
  }

  group (condition) {
    const groups = _.groupBy(this.items, (item) => {
      if (_.isFunction(condition)) {
        return condition(item);
      }

      return item[condition];
    });

    const g = Object.keys(groups).map(key => ({ key, items: new Collection(groups[key]) }));

    return new GroupedCollection(g);
  }
}


class Query {
  constructor (items) {
    if (!items) {
      throw new Error('A query can not be created without a collection of items');
    }

    this.items = new Collection(items);
  }

  find (filters) {
    this.items = this.items.filter(filters);
    return this;
  }

  select (projections) {
    return this.items.select(projections);
  }

  group (condition) {
    this.items = this.items.group(condition);
    return this;
  }

  order (condition) {
    this.orderBy = condition;
    this.items.orderBy = condition;
    return this;
  }
}

module.exports = Query;
