import { groupBy } from 'lodash'

import project, { isSumProjection, isMaxProjection, ProjectionDefinition, Projected } from './project'
import Foo, { Filter } from './simple-filter'
import order, { OrderCondition } from './order'

class GroupedCollection<Item extends QueryableObject> {
  private groups: { key: string, items: Collection<Item> }[]
  // private orderBy: any

  constructor (groups: { key: string, items: Collection<Item> }[]) {
    this.groups = groups
  }

  select (projections?: ProjectionDefinition<Item>): { [key: string]: Projected<Item, ProjectionDefinition<Item>> }[] {
    const wrappedGroups: { key: string, projected: Projected<Item, ProjectionDefinition<Item>> }[]
    = this.groups.map(group => {
      return { key: group.key, projected: group.items.select(projections) }
    })
    // const ordered = order.orderGroupsBy(wrappedGroups, this.orderBy);
    const orderedProjections = wrappedGroups.map((
      { key, projected }
      :
      { key: string, projected: Projected<Item, ProjectionDefinition<Item>> }) => {
      return { [key]: projected }
    })

    return orderedProjections
  }
}


class Collection<Item extends QueryableObject> {
  private items: Item[]
  // Note: make this private
  public orderBy?: OrderCondition<Item>

  constructor (items: Item[]) {
    this.items = items
  }

  filter (filter: Filter<Item>): Collection<Item> {
    this.items = Foo(filter, this.items)

    return this
  }

  select (projections?: ProjectionDefinition<Item>)
    : Projected<Item, ProjectionDefinition<Item>> {
    if (!projections) {
      if (!this.orderBy) {
        return this.items
      }

      return order.orderBy(this.items, this.orderBy)
    }

    let projected = project(this.items, projections)

    if (!this.orderBy) {
      return projected
    }

    if (isSumProjection(projections)) {
      throw Error('Can not use the "sum" projection together with ordering')
    }

    if (isMaxProjection(projections)) {
      throw Error('Can not use the "max" projection together with ordering')
    }

    // Note: had to cast it or otherwise it still though "projected" could be
    // of type { sum: ... } or { max: ... }
    return order.orderBy(projected as (Item[] | Pick<Item, keyof Item>[]), this.orderBy)
    // return project(this.items, projections)
  }

  group (condition: GroupingCondition<Item>): GroupedCollection<Item> {
    const groupedItems = groupBy(this.items, (item: Item) => {
      if (typeof condition.by === 'function') {
        return condition.by(item)
      }

      return item[condition.by]
    })

    const g = Object.keys(groupedItems).map(key => ({ key, items: new Collection(groupedItems[key]) }))

    return new GroupedCollection(g)
  }
}

type GroupingConditionFunction<Item> = ((item: Item) => number | string)
type GroupingCondition<Item> = { by: keyof Item | GroupingConditionFunction<Item> }


export interface QueryableObject {
  [key: string]: string | number | Date
}

export default class Query<Item extends QueryableObject> {
  private items: Collection<Item>
  private groupedItems?: GroupedCollection<Item>

  constructor (items: Item[]) {
    this.items = new Collection(items)
    // this.groupedItems = undefined
  }

  find (filter?: Filter<Item>): Query<Item> {
    if (!filter) {
      return this
    }

    this.items = this.items.filter(filter)
    return this
  }

  select (projections?: ProjectionDefinition<Item>): { [key: string]: any} {
    return (this.groupedItems || this.items).select(projections)
  }

  group (condition: GroupingCondition<Item>): Query<Item> {
    this.groupedItems = this.items.group(condition)
    return this
  }

  order (condition: OrderCondition<Item>): Query<Item> {
    this.items.orderBy = condition
    return this
  }
}
