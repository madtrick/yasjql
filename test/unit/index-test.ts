import Query from '../../src/query'
import chai = require('../helper')

const expect = chai.expect

describe('Query', function () {
  describe('projections', function () {
    it('without arguments returns the source itmes', function () {
      const items = [{ foo: 1 }, { foo: 2 }]
      const query = new Query(items)

      const result = query.select()

      expect(result).to.eql(items)
    })

    it('can get all the values of a given column', function () {
      const items = [ { foo: 1, bar: 1 }, { foo: 2, bar: 2 } ]
      const query = new Query(items)

      const result = query.select(['foo', 'lol'])

      expect(result).to.eql([ { foo: 1 }, { foo: 2 } ])
    })

    it('can get all the values of the given columns', function () {
      const items = [ { foo: 1, bar: 1, baz: 1 }, { foo: 2, bar: 2, baz: 2 } ]
      const query = new Query(items)

      const result = query.select(['foo', 'bar'])

      expect(result).to.eql([ { foo: 1, bar: 1 }, { foo: 2, bar: 2 } ])
    })

    it('can get all the uniq values of a given column', function () {
      const items = [ { foo: 1 }, { foo: 2 }, { foo: 2 } ]
      const query = new Query(items)

      const result = query.select({ uniq: 'foo' })

      expect(result).to.eql([ { foo: 1 }, { foo: 2 } ])
    })

    describe('agregations', function () {
      it('can get the max value of a given column', function () {
        const items = [ { foo: 1 }, { foo: 2 } ]
        const query = new Query(items)

        const result = query.select({ max: 'foo' })

        expect(result).to.eql({ max: 2 })
      })

      it('can get the sum of the values of a given column', function () {
        const items = [ { foo: 1 }, { foo: 2 } ]
        const query = new Query(items)

        const result = query.select({ sum: 'foo' })

        expect(result).to.eql({ sum: 3 })
      })
    })
  })

  describe('groups', function () {
    // throws if given more than one grouping condition
    it('groups by the column name', function () {
      const items = [ { foo: 1, bar: 1 }, { foo: 1, bar: 2 }, { foo: 2, bar: 2 } ]
      const query = new Query(items)

      const result = query.find().group({ by: 'foo' }).select()

      expect(result).to.eql([ { '1': [{ foo: 1, bar: 1 }, { foo: 1, bar: 2 }] }, { '2': [{ foo: 2, bar: 2 }] } ])
    })

    it('groups by the function', function () {
      const items = [ { foo: 1, bar: 1 }, { foo: 1, bar: 2 }, { foo: 2, bar: 2 } ]
      const query = new Query(items)

      const groupBy = (item: any) => item.foo
      const result = query.find().group({ by: groupBy }).select()

      expect(result).to.eql([ { '1': [{ foo: 1, bar: 1 }, { foo: 1, bar: 2 }] }, { '2': [{ foo: 2, bar: 2 }] } ])
    })

    describe('aggregations', function () {
      it('can get the sum of the values of a given column', function () {
        const items = [ { foo: 1, bar: 1 }, { foo: 1, bar: 2 }, { foo: 2, bar: 2 } ]
        const query = new Query(items)

        const result = query.find().group({ by: 'foo' }).select({ sum: 'foo' })

        expect(result).to.eql([ { '1': { sum: 2 } }, { '2': { sum: 2 } } ])
      })
    })
  })

  describe('filters', function () {
    it('without arguments returns the source items', function () {
      const items = [{ foo: 'very wow' }, { foo: 'very lol wow' }, { foo: 'such omg' }]
      const query = new Query(items)

      const result = query.find().select()

      expect(result).to.eql(items)
    })

    describe('match', function () {
      it('returns those items matching a regexp', function () {
        const items = [{ foo: 'very wow' }, { foo: 'very lol wow' }, { foo: 'such omg' }]
        const query = new Query(items)

        const result = query.find({ foo: { match: /lol / } }).select()

        expect(result).to.eql([{ foo: 'very lol wow' }])
      })

      it('returns those items matching a regexp (case insensitive)', function () {
        const items = [{ foo: 'very wow' }, { foo: 'very LOL wow' }, { foo: 'such omg' }]
        const query = new Query(items)

        const result = query.find({ foo: { match: 'lol' } }).select()

        expect(result).to.eql([ { foo: 'very LOL wow' } ])
      })
    })

    describe('inclusion', function () {
      it('returns only those items with values in the set', function () {
        const items = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
        const query = new Query(items)

        const result = query.find({ foo: { in: [1, 2] } }).select()

        expect(result).to.eql([{ foo: 1 }, { foo: 2 }])
      })
    })

    describe('non inclusion', function () {
      it('returns only those items with values not in the set', function () {
        const items = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
        const query = new Query(items)

        const result = query.find({ foo: { nin: [1, 2] } }).select()

        expect(result).to.eql([{ foo: 3 }])
      })
    })

    describe('equality', function () {
      it('returns only those items equal to a given value', function () {
        const items = [{ foo: 1 }, { foo: 2 }]
        const query = new Query(items)

        const result = query.find({ foo: { eq: 1 } }).select()

        expect(result).to.eql([{ foo: 1 }])
      })
    })

    describe('range', function () {
      // Note: shouldn't I keep this behaviour for when this library is used
      // with other non JS code (no type safety there)
      // it.skip('throws if both operands are not of the same type', function () {
      //   const date = new Date('2016-10-16')
      //   const items = [{ foo: 1 }]
      //   const query = new Query(items)

      //   expect(() => query.find({ foo: { lt: date } }).select()).to.throw(Error)
      // })

      describe('with numbers', function () {
        it('returns only those items greater than a given value', function () {
          const items = [{ foo: 1 }, { foo: 2 }]
          const query = new Query(items)

          const result = query.find({ foo: { gt: 1 } }).select()

          expect(result).to.eql([{ foo: 2 }])
        })

        it('returns only those items smaller than a given value', function () {
          const items = [{ foo: 1 }, { foo: 2 }]
          const query = new Query(items)

          const result = query.find({ foo: { lt: 2 } }).select()

          expect(result).to.eql([{ foo: 1 }])
        })

        it('returns only those items greater and smaller than a given value', function () {
          const items = [{ foo: 1 }, { foo: 2 }, { foo: 4 }]
          const query = new Query(items)

          const result = query.find({ foo: { gt: 1, lt: 3 } }).select()

          expect(result).to.eql([{ foo: 2 }])
        })
      })

      describe('with dates', function () {
        describe('lt', function () {
          it('returns only those items with a date before the given one', function () {
            const date1 = new Date('2016-10-12')
            const date2 = new Date('2016-10-14')
            const date3 = new Date('2016-10-16')
            const items = [{ foo: 1, date: date1 }, { foo: 2, date: date2 }, { foo: 3, date: date3 }]
            const query = new Query(items)

            const result = query.find({ date: { lt: date2 } }).select()

            expect(result).to.eql([{ foo: 1, date: date1 }])
          })
        })

        describe('gt', function () {
          it('returns only those items with a date after the given one', function () {
            const date1 = new Date('2016-10-12')
            const date2 = new Date('2016-10-14')
            const date3 = new Date('2016-10-16')
            const items = [{ foo: 1, date: date1 }, { foo: 2, date: date2 }, { foo: 3, date: date3 }]
            const query = new Query(items)

            const result = query.find({ date: { gt: date2 } }).select()

            expect(result).to.eql([{ foo: 3, date: date3 }])
          })
        })
      })
    })
  })

  describe('ordering', function () {
    it('orders the result set', function () {
      const items = [{ foo: 2 }, { foo: 1 }]
      const query = new Query(items)

      const result = query.find().order('foo').select()

      expect(result).to.eql([{ foo: 1 }, { foo: 2 }])
    })

    it('orders the result set (descending)', function () {
      const items = [{ foo: 1 }, { foo: 2 }]
      const query = new Query(items)

      const result = query.find().order({ foo: 'desc' }).select()

      expect(result).to.eql([{ foo: 2 }, { foo: 1 }])
    })

    // it('orders the nested result set', function () {
    //   const items = [{ foo: { bar: 2 } }, { foo: { bar: 1 } }]
    //   const query = new Query(items)

    //   const result = query.find().order('foo.bar').select()

    //   expect(result).to.eql([ { foo: { bar: 1 } }, { foo: { bar: 2 } } ])
    // })

    // it('orders the nested result set (descending)', function () {
    //   const items = [ {foo: {bar: 2}}, {foo: {bar: 1}} ]
    //   const query = new Query(items)

    //   const result = query.find().order({'foo.bar': 'desc'}).select()

    //   expect(result).to.eql([ {foo: {bar: 2}}, {foo: {bar: 1}} ])
    // })

    it('orders by group', function () {
      const items = [{ foo: 3, bar: 2 }, { foo: 1, bar: 1 }, { foo: 1, bar: 3 }]
      const query = new Query(items)

      const result = query.find().group({ by: 'foo' }).order('foo').select()

      expect(result).to.eql([ { 1: [{ foo: 1, bar: 1 }, { foo: 1, bar: 3 }] }, { 3: [{ foo: 3, bar: 2 }] }])
    })

    // it('orders by group aggregation', function () {
    //   const items = [ {foo: 3, bar: 2}, { foo: 1, bar: 1 }, {foo: 1, bar: 3} ]
    //   const query = new Query(items)

    //   const result = query.find().group('foo').order('foo.sum').select({ sum:  'foo' })

    //   expect(result).to.eql([ { 1: {sum: 2} }, { 3: {sum: 3} }])
    // })

    // it('orders by group aggregation (descending)', function () {
    //   const items = [ {foo: 3, bar: 2}, { foo: 1, bar: 1 }, {foo: 1, bar: 3} ]
    //   const query = new Query(items)

    //   const result = query.find().group('foo').order({'foo.sum': 'desc'}).select({ sum:  'foo' })

    //   expect(result).to.eql([ { 3: {sum: 3} }, { 1: {sum: 2} }])
    // })
  })

  it('can combine restrictions', function () {
    const items = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
    const filter = { foo: { gt: 1, lt: 3 } }

    const query = new Query(items)

    const result = query.find(filter).select()

    expect(result).to.eql([ { foo: 2 } ])
  })

  // it('can combine restrictions with an "or"', function () {
  //   const items = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
  //   const filter = { foo: [{ eq: 1 }, { eq: 2 }] }

  //   const query = new Query(items)

  //   const result = query.find(filter).select()

  //   expect(result).to.eql([ { foo: 1 }, { foo: 2 } ])
  // })

  // it('can combine filters with an "or"', function () {
  //   const items = [ {foo: 1, bar: 5}, {foo: 2, bar: 6}, {foo: 3} ]
  //   const filter = [{foo: {eq: 1}}, {bar: {eq: 6}}]

  //   const query = new Query(items)

  //   const result = query.find(filter).select()

  //   expect(result).to.eql([ {foo: 1, bar: 5}, {foo: 2, bar: 6} ])
  // })

  // it('can combine filters and constraints an "or"', function () {
  //   const items = [ {foo: 1, bar: 5}, {foo: 2, bar: 6}, {foo: 3}, {foo: 4} ]
  //   const filter = [{foo: [{eq: 1}, {eq: 3}]}, {bar: {eq: 6}}]

  //   const query = new Query(items)

  //   const result = query.find(filter).select()

  //   expect(result).to.eql([ {foo: 1, bar: 5}, {foo: 2, bar: 6}, {foo: 3} ])
  // })
})
