export type Prettify<Type> = {
    [Key in keyof Type]: Type[Key];
} & {};

export type Maybe<Type> = Type | null | undefined;

export type KeysOfValue<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition
        ? K
        : never;
}[keyof T];

export type Concrete<Type> = {
    [Property in keyof Type]-?: Type[Property];
};

export type CreateMutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
};

export type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};

export type RemoveField<Type, TCondition> = {
    [Property in keyof Type as Exclude<Property, TCondition>]: Type[Property]
};

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export type ToArray<Type> = Type extends any ? Type[] : never;

export type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;