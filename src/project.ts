import * as _ from 'lodash';

export default function project (items: any, projections: any): {[key: string]: any} {
  if (!projections) {
    return items;
  }

  if (Array.isArray(projections)) {
    return items.map((item: any) => _.pick(item, projections));
  }

  if (projections.max) {
    const col = projections.max;
    const max: { [key: string]: any } = _.sortBy(items, [col])[items.length - 1];

    return { max: max[col] };
  }

  if (projections.sum) {
    const col = projections.sum;
    const sum = _.sumBy(items, col);

    return { sum };
  }

  if (projections.uniq) {
    const col = projections.uniq;
    const values = _.uniq(items.map((i: any) => i[col]));


    return values.map(value => ({ [col]: value }));
  }

  const columns = Object.keys(projections)[0];
  const as = projections[columns].as;

  return items.map((item: any) => {
    const clone: {[key: string]: any} = {};
    const value = item[columns];
    clone[as] = value;

    return clone;
  });
};
