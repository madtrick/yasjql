import  * as _ from 'lodash';

import project from './project';
// import filter from './filter';
// import order from './order';


// class GroupedCollection<Item> {
//   private groups: any[]
//   private orderBy: any

//   constructor (groups: any[]) {
//     this.groups = groups;
//   }

//   select (projections?: any[]) {
//     const wrappedGroups = this.groups.map(group =>
//                               ({ key: group.key, projection: group.items.select(projections) }));
//     const ordered = order.orderGroupsBy(wrappedGroups, this.orderBy);
//     const orderedProjections = ordered.map((group: any) => ({ [group.key]: group.projection }));

//     return orderedProjections;
//   }
// }


class Collection<Item extends QueryableObject> {
  private items: Item[]
  // Note: make this private
  public orderBy?: OrderCondition

  constructor (items: Item[]) {
    this.items = items;
  }

  // filter (filters?: any[]) {
  //   this.items = filter(filters, this.items);

  //   return this;
  // }

  select (projections?: any[]) {
    // return order.orderBy(project(this.items, projections), this.orderBy);
    return project(this.items, projections)
  }

  // group (condition: GroupingCondition<Item>) {
  //   const groups = _.groupBy(this.items, (item: Item) => {
  //     if (isFunctionCondition(condition)) {
  //       return condition(item);
  //     }

  //     return item[condition];
  //   });

  //   const g = Object.keys(groups).map(key => ({ key, items: new Collection(groups[key]) }));

  //   return new GroupedCollection(g);
  // }
}

// Note: can we restrict the condition to be one key
// of a generic type
type GroupConditionFunction<Item> = ((item: Item) => any)
type GroupingCondition<Item> = string | GroupConditionFunction<Item>
function isFunctionCondition<Item> (condition: GroupingCondition<Item>): condition is GroupConditionFunction<Item> {
  return _.isFunction(condition)
}

// Note: can we restrict the number of properties in the object
// i.e. avoid having { foo: 'desc', bar: 'asc' }
type OrderCondition = string | { [key: string]: 'asc' | 'desc' }


interface QueryableObject {
  [key: string]: boolean | string | number | QueryableObject
}

export default class Query<Item extends QueryableObject> {
  private items: Collection<Item>
  // private groupedItems?: GroupedCollection<Item>
  private orderBy?: OrderCondition

  constructor (items: Item[]) {
    this.items = new Collection(items);
    // this.groupedItems = undefined
  }

  // find (filters?: any[]) {
  //   this.items = this.items.filter(filters);
  //   return this;
  // }

  select (projections?: any[]) {
    // return (this.groupedItems || this.items).select(projections);
    return this.items.select(projections);
  }

  // group (condition: GroupingCondition<Item>) {
  //   this.groupedItems = this.items.group(condition);
  //   return this;
  // }

  // order (condition: OrderCondition) {
  //   this.orderBy = condition;
  //   this.items.orderBy = condition;
  //   return this;
  // }
}
