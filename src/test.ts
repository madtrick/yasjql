type ValidValue = string | number
type OptionsImp<V extends ValidValue> = (value: V) => boolean


const SomeTypeOptions: {
  one: OptionsImp<number>,
  two: OptionsImp<string>
} = {
  one: (_arg: number) => true,
  two: (_arg: string) => true
}

interface Types {
  one: number,
  two: string
}


function f<K extends keyof Types> (key: K, arg: Types[typeof key]): boolean {
  const func: OptionsImp<typeof arg> = SomeTypeOptions[key]

  return func(arg)
}

f('one', 1)
f('two', '2')

