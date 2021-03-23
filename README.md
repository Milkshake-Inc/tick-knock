# Tick-Knock

> Small and powerful, type-safe and easy-to-use Entity-Component-System (ECS) library written in TypeScript

[![Build Status](https://travis-ci.org/mayakwd/tick-knock.svg?branch=master)](https://travis-ci.org/mayakwd/tick-knock)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/mayakwd/tick-knock/develop.svg?style=flat-square)](https://codecov.io/gh/mayakwd/tick-knock/)

# Table of contents

- [Installing]
- [How it works?]
- [Inside the Tick-Knock]
    - [Engine]
        - [Subscription]
    - [Component]
    - [Tag]
    - [Entity]
    - [System]
    - [Query]
        - [QueryBuilder]
        - [Queries and Systems]
        - [Built-in query-based systems]
            - [ReactionSystem]
            - [IterativeSystem]
    - [Snapshot]
    - [Shared Config]
- [Restrictions]
    - [Shared and Local Queries]
    - [Queries with complex logic and Entity invalidation]
- [License]
- [Donation]

# Installing

- Yarn: `yarn add tick-knock`
- NPM: `npm i --save tick-knock`

# How it works?

Tick-Knock was inspired by several ECS libraries, mostly by [Ash ECS](https://www.richardlord.net/ash/).

The main approach was re-imagined to make it lightweight, easy-to-use, and less boiler-plate based.

# Inside the Tick-Knock

In this part, you will learn all basics of Tick-Knock step by step.

## Engine

Engine is a "world" where entities, systems, and queries interact with each other.

Since the Engine is the initial entry point for development with Tick-Knock, it is from this point that the creation of
your world starts. Usually, the Engine exists in just one instance, and it does nothing but orchestrating everything
added to it.

To begin with, you can add the most usual "inhabitants" to it.

```typescript
const engine = new Engine();
const entity = new Entity()
  .add(new Hero())
  .add(new health(10))
engine.addEntity(entity);
```

Or you can take it out:

```typescript
engine.removeEntity(entity);
```

The second main "inhabitant" is System. It is responsible for processing Entities and their components. We will learn
about them in detail later.

```typescript
engine.addSystem(new ViewSystem(), 1);
engine.addSystem(new PhysicsSystem(), 2);
```

As you may have noticed, we pass two parameters: system instance, and the second is update priority. The higher the
priority number is, the later the system will be processed.

The third type of resident is Query, which is responsible for mapping entities within the Engine and returns a list of
already filtered and ready-to-use entities.

```typescript
const heroesQuery = new Query((entity) => entity.has(Hero));
engine.addQuery(heroesQuery);
````

The main task of the engine is to start the world update process and to report on the ongoing changes to Queries.  
These changes can be: additions to and removal of entities from the Engine, and changes in the components of specific
Entities.

To perform the update step, we must call the `update` method and pass as a parameter the time elapsed since the previous
update.  
Every time we start an update, the systems take turns, in order of priority, executing their own update methods.

```typescript
// Half a second has passed from the previous step.
engine.update(0.5); 
```

### Subscription

An additional - one of the Engine's responsibilities - transferring the messages from systems to the user. This can be
very useful when, for example, you want to report that the round in your game is over.

```typescript
engine.subscribe(GameOver, (message: GameOver) => {
  if (game.win) {
    this.showWinMessage();
  } else {
    this.showLoseMessage();
  }
});
```

You can use not only class type as an argument but any value. For example, it could be a string or number.

```typescript
const GAME_OVER = 'gameOver';
engine.subscribe(GAME_OVER, () => {
  this.showGameOver();
});
```

> **Details of implementation**
>
> When the `dispatch` method is called in the system, then to get the right listeners, the compliance of the `messageType` for each subscription will be checked.
> - If `typeof subscription.messageType` is a `'function'`, then the matching will be performed using `instanceOf`.
> - Otherwise, the matching will be done through strict equality `message === subscription.messageType`.

## Component

It is a data object, its purpose - to represent a single aspect of your entity. For example, position, velocity,
acceleration.

- ❕ Any class could be considered as the component. There are no restrictions.
- ❗ For proper understanding, it needs to be noticed that the component should be a data class, without any logic.
  Otherwise, you'll lose the benefits of the ECS pattern.

**Let's write your first component:**

```typescript
class Position {
  public constructor(
    public x: number = 0,
    public y: number = 0
  ) {}
}
```

> Yes, this is a component! 🎉

## Linked component

It is still a data class, but it is made to solve the problem when you need to have multiple components of the same
type.

Let's assume that you have a Damage component in your game. Several enemies attack the Hero simultaneously by adding the
Damage component to it. What will happen? Only the last Damage component will be added to the Hero Entity because every
previous one will be removed.

To solve this problem - you need to implement ILinkedComponent interface in your Damage component and "append" instead
of "add" the Damage component to the entity. That will do the job. After that, in DamageSystem you can find all damage
sources:

```typescript
class Damage implements ILinkedComponent {
  public constructor(
    public readonly value: number
  ) {}
}

hero.append(new Damage(100));
hero.append(new Damage(5));

class DamageSystem extends IterativeSystem {
  public constructor() {
    super((entity) => entity.hasAll(Damage, Health));
  }

  public updateEntity(entity: Entity) {
    const health = entity.get(Health)!;
    let damage = entity.remove(Damage)!;
    while (damage !== undefined) {
      health.value -= damage.value;
      damage = damage.next;
    }
  }
}
```

## Tag

Also can be called a "label". It's a simplistic way to help you not "inflate" your code with classes without data. For
instance, you want to mark your entity as Dead. There are two ways:

- To create a component class: `class Dead {}`
- Or to create a tag - that can be represented as a `string` or `number`.

Using tags is much easier and consumes less memory if you do not have additional component data.

**Example:**

```typescript
const ENEMY = 'enemy';
const HERO = 100500;
```

> Keep it simple! 😄

## Entity

It is a general-purpose object, which can be marked with tags and can contain different components.

- So it can be considered as a container that can represent any in-game entity, like an enemy, bomb, configuration, game
  state, etc.
- Entity can contain only one component or tag of each type. You can't add two `Position` components to the entity, the
  second one will replace the first one.

**This is how it works:**

```typescript
const entity = new Entity()
  .add(new Position(100, 100))
  .add(new Position(200, 200))
  .add(HERO);

console.log(entity.get(Position)); // Position(x = 200, y = 200)
```

> Looks easy? Yes, it is!

## System

Systems are logic bricks in your application. If you want to manipulate entities, their components, and tags - it is the
right place.

Please, keep in mind that the complexity of the system mustn't be too high. When you find that your system is doing too
much in the "update" method, you need to split it into several systems.

Responsibility of the system should cover no more than one logical aspect.

The system always has the following functionality:

- Priority, which can be set before adding a system to the engine.
- Reference to the `engine` will give you access to the engine itself and its entities. But be aware - you can't access
  an engine if the system is not connected to it. Otherwise, you'll get an error.
- Methods `onAddedToEngine` and `onRemovedFromEngine` will be called in the cases described by their naming.
- With the method `dispatch`, you can easily send a message outside of the system. It will be delivered through the
  engine [Subscription](#subscription) pipe. There are the same restrictions as for the engine. If the system is not
  attached to the engine, then an attempt to send a message will throw an error.
- And last but not least, the heart of your system - method `update`. It will be called whenever `Engine.update` is
  being invoked. Update method - the right place to put your logic.

**Example:**
It's time to write our first and straightforward system. It will iterate through all the entities that are in the
Engine, check if they have Position and Velocity components.  
And if they do, then move our object.

```typescript
class Velocity {
  public constructor(
    public x: number = 0,
    public y: number = 0
  ) {}
}

class PhysicsSystem extends System {
  public constructor() {
    super();
  }

  public update(dt: number): void {
    const {entities} = this.engine;
    for (const entity of entities) {
      if (entity.hasAll(Position, Velocity)) {
        const position = entity.get(Position)!;
        const velocity = entity.get(Velocity)!;
        position.x += velocity.x * dt;
        position.y += velocity.y * dt;
      }
    }
  }
}
```

> There you go!
🎁 In real life, you don't have to iterate through every entity in every system. It's completely uncomfortable and not optimal. In this library, there is a mechanism that can prepare a list of the entities that you need according to the criteria you set - it's called Query.

## Query

So what the "Query" is? It's a matching mechanism that can tell you which entities in the Engine are suitable for your
needs.

For example, you want to write a system that is responsible for displaying sprites on your screen. To do this, you
always need a current list of entities, each of which has three components - View, Position, Rotation, and you want to
exclude those marked with the HIDDEN tag.

**Let's write our first Query.**

```typescript
const displayListQuery = new Query((entity: Entity) => {
  return entity.hasAll(View, Position, Rotation) && !entity.has(HIDDEN);
});
```

> That's all!

Adding this Query to the Engine will always contain an up-to-date list of entities that meet the described requirements.
Besides, you can always find out when a new entity has appeared in the Query, or an old entity has left it.

```typescript
displayListQuery.onEntityAdded = ({current}: EntitySnapshot) => {
  console.log("We've got a rookie here!");
  container.addChild(current.get(View)!.view);
}
displayListQuery.onEntityRemoved = ({previous}: EntitySnapshot) => {
  container.removeChild(previous.get(View)!.view);
  console.log("Good bye, friend!");
}
```

### QueryBuilder

Query builder is super simple. It has not much power, but you can use it for creating queries that must contain specific
Components.

```typescript
const query: Query = new QueryBuilder()
  .contains(ComponentA, ComponentB)
  .contains(TAG)
  .build();
```

### Queries and Systems

Now let's see how we can use Query on systems?

Let's write `ViewSystem`, which will be responsible for displaying our Entity on the screen.  
When entities get to the list, the system will add them to the screen, and when they leave the list, the system will
remove them from the screen.

**Example:**

```typescript
const query = new Query((entity: Entity) => {
  return entity.hasAll(View, Position, Rotation) && !entity.has(HIDDEN);
});

class ViewSystem extends System {
  public constructor(
    private readonly container: Container
  ) { super(); }

  public onAddedToEngine(): void {
    // To make query work - we need to add it to the engine
    this.engine.addQuery(query);
    // And we need to add to the display list all entities that already 
    // exists in the Engine`s world and matches our Query 
    this.prepare();
    // We want to know if new entities were added or removed
    query.onEntityAdded.connect(this.onEntityAdded);
    query.onEntityRemoved.connect(this.onEntityRemoved);
  }

  public onRemovedFromEngine(): void {
    // There is no reason to update query after system was removed 
    // from the engine
    this.engine.removeQuery(query);
    // No reason for further listening of the updates
    query.onEntityAdded.disconnect(this.onEntityAdded);
    query.onEntityRemoved.disconnect(this.onEntityRemoved);
  }

  // We only want to update positions of the views on the screen,
  // so there is no need for "dt" parameter, it can be omitted
  public update(): void {
    const entities = this.query.entities;
    for (const entity of entities) {
      this.updatePosition(entity);
    }
  }

  private prepare(): void {
    for (const entity of this.query.entities) {
      this.onEntityAdded(entity);
    }
  }

  private updatePosition(entity: Entity): void {
    const {view} = entity.get(View)!;
    const {x, y} = entity.get(Position)!;
    const {rotation} = entity.get(Rotation)!;
    view.position.set(x, y);
    view.rotaion.set(rotation);
  }

  private onEntityAdded = ({entity}: EntitySnapshot) => {
    // Let's add new view to the screen
    this.container.addChild(entity.get(View)!.view);
    // Don't forget to update it's position on the screen
    this.updatePosition(entity);
  };

  private onEntityRemoved = (snapshot: EntitySnapshot) => {
    // Let's remove the view from the screen, because Entity no longer 
    // meets the requirements (might be it lost the View component 
    // or it was hidden)
    this.container.removeChild(snapshot.get(View)!.view);
  };
}
```

> 😎 I'm sure you saw the reference to `EntitySnapshot` and wondering, "what the heck is that?". Please, be patient, [I'll tell you about](#Snapshot) it a bit later.
> I think it looks good and clear for understanding!

- 🤔 You can say: "we need to write too much boilerplate-code".
- And of course, Tick-Knock will help you to reduce boilerplate-code!

### Built-in query-based systems

In favor of reducing the time to write the boilerplate code - Tick-Knock provides two built-in systems. Each of them
already knows how to work with Query, process the information coming from it, and allow access to this Query's entities.

All of the following built-in systems have the following features:

You can initialize those systems via three different items, which will be converted to Query eventually:

- Query itself
- Query predicate - Query will be automatically created on top of it. This feature was introduced to reduce the size of
  the boilerplate code.
- QueryBuilder - it is also a valid option.
- They have a getter `entities`, which returns the current entities list of the Query.
- They have a built-in property entityAdded and entityRemoved, you need to define them if you want to track Query
  changes.

#### ReactionSystem

ReactionSystem can be considered as the system that has the ability to react to changes in Query. It is a basic built-in
system. Exactly it will be used in most cases when developing your application.

Let's try to rewrite our ViewSystem, taking ReactionSystem as a basis, and take advantage of all the conveniences it
provides.

**Example:**

```typescript
class ViewSystem extends ReactionSystem {
  public constructor(private readonly container: Container) {
    super((entity: Entity) => {
      return entity.hasAll(View, Position, Rotation) && !entity.has(HIDDEN);
    });
  }

  public update(): void {
    for (const entity of this.entities) {
      this.updatePosition(entity);
    }
  }

  protected prepare(): void {
    for (const entity of this.entities) {
      this.entityAdded(entity);
    }
  }

  private updatePosition(entity: Entity): void {
    const {view} = entity.get(View)!;
    const {x, y} = entity.get(Position)!;
    const {rotation} = entity.get(Rotation)!;
    view.position.set(x, y);
    view.rotaion.set(rotation);
  }

  protected entityAdded = ({entity}: EntitySnapshot) => {
    this.updatePosition(entity);
    this.container.addChild(entity.get(View)!.view);
  };

  protected entityRemoved = (snapshot: EntitySnapshot) => {
    this.container.removeChild(snapshot.get(View)!.view);
  };
}
```

> Now it's pretty simpler! 🎉

#### IterativeSystem

This system has the same advantages as the ReactionSystem because it is inherited from the last one. 😅 All it brings is
a built-in iteration cycle for our Query inside the update method.

**So, let's upgrade our `ViewSystem` a bit.**

```typescript
class ViewSystem extends IterativeSystem {
  // almost everything remains the same, so I'll skip most of the code.
  // The only difference regarding example with ReactionSystem - that we 
  // don't need to override `update` method. 
  // Instead of it we need to override updateEntity method.
  // Also, we can safely omit the dt parameter because we do not use it.
  protected updateEntity(entity: Entity, dt: number) {
    this.updatePosition(entity);
  }
}
```

## Snapshot

As you may have noticed, when we are tracking changes in Query, we get in `entityAdded` and `entityRemoved` not `Entity`
but `EntitySnapshot`.
**So what is a snapshot?**
It is a container that displays the difference between the current state of Entity and its previous state. The `entity`
property always reflects the current state. Still, methods ` get` and `has` methods of the snapshot return the data from
the previous state of the Entity before it was changed. So you can understand which components have been added and which
have been removed.

> ❗ It is important to note that changes in the same entity components' data will not be reflected in the snapshot, even if a manual invalidation of the entity has been triggered.

Snapshots are very handy when you need to get a component or tag in Entity, but now it is missing. Let's take a closer
look at it with our `ViewSystem` example.
**Example:**

```typescript
class ViewSystem extends IterativeSystem {
  // ...
  protected entityAdded = (snapshot: EntitySnapshot) => {
    // When entity added to the Query that means that it has `View` 
    // component - one hundred percent! So we just need its current 
    // state. 
    const {current} = snapshot;
    this.container.addChild(current.get(View)!.view);
    this.updatePosition(entity);
  };

  protected entityRemoved = ({previous}: EntitySnapshot) => {
    // But when entity removed - we can't be sure that current state 
    // of the entity has `View` component. So we need to get it from
    // the previous state. Previous state has it one hundred percent.
    this.container.removeChild(previous.get(View)!.view);
  };
  // ...
}
```

## Shared Config

In real life, there is often a need to have a single Entity that acts as a configuration for the whole world.

For example, you have a set of complex systems that involve both game logic and visualization, and animations. But for
functional test purposes - you don't care about the visuals and animations. You face the situation of passing a specific
flag in each system during initialization, which will be responsible for disabling animation and visualization.

Now imagine that you have several configuration parameters, and each of them you need to pass to all systems of your
world.

To simplify handling such situations - you can use `Engine.sharedConfig`. Shared Config is an `Entity` available in all
systems after adding them to `Engine`.

**Example:**

```typescript
const NO_VISUALS = 'no-visuals';

class ViewSystem extends IterativeSystem {
  protected updateEntity(entity: Entity): void {
    if (this.sharedConfig.has(NO_VISUALS)) {
      return;
    }

    // Otherwise - update visuals
  }
}

const engine = new Engine();
engine.sharedConfig.add(NO_VISUALS);
engine.addSystem(new ViewSystem());
```

> ☝ Shared Config is the single instance connected to `Engine` since its initialization and can't be removed from it. It affects queries like any regular `Entity`.

# Restrictions

## Shared and Local Queries

In real development, you'll definitely face a situation when you want to reuse Query.

For example, when developing a game with heroes and enemies, you will surely always need two queries:

**Simplified version**

```typescript
const heroes = new Query(entity => entity.has(Hero));
const enemies = new Query(entity => entity.has(Enemy));
```

And you will want to use them in different systems. But the systems use local Queries. This means that after excluding a
system from Engine, the Query in it will no longer be updated.

To prevent this from happening, you need to use the shared queries approach. To do this, you only need to add the query
manually after initializing the Engine.

> shared-queries.ts
```typescript
export const heroes = new Query(entity => entity.has(Hero));
export const enemies = new Query(entity => entity.has(Enemy));
```

```typescript
import {heroes, enemies} from 'shared-queries';
// ...
engine.addQuery(heroes);
engine.addQuery(enemies)
```

Now you can use these Queries in any other system.

**Example:**

```typescript
import {heroes, enemies} from 'shared-queries';

class DamageSystem extends IterativeSystem {
  // ...
  protected updateEntity(entity: Entity) {
    const damage = entity.remove(Damage)!
    const isHero = heroes.has(entity);
    if (damage.type === DamageType.SPLASH) {
      const neighbours = getNeighbours(isHero ? heroes : enemies);
      // ...
    }
  }
}
```

## Queries with complex logic and Entity invalidation

There are limitations for Query that do not allow you to track changes made inside components automatically.

Suppose that you want Query to track entities with an X position of 10.

```typescript
const query = new Query((entity) => entity.has(Position) && entity.get(Position).x === 10);
```

And you have changed the Position parameters accordingly:

```typescript
entity.get(Position)!.x = 10;
```

The query will not know about these changes because the mechanism for tracking changes in component fields is redundant
and heavy, which will have a huge impact on performance. But to fix this, you can use an entity method
called `invalidate`, it will force Query to check this particular entity.

❗ Try not to use this approach too often. It may affect the performance of your application.

# License

This software released under [MIT](https://github.com/Leopotam/ecs/blob/master/LICENSE.md) license! Good luck, folks.

# Donation

It's free and open source, but you can donate if you pleased:  
[![Donate](https://img.shields.io/badge/Donate-Yandex.Money-yellowgreen)](https://money.yandex.ru/to/41001136426726)
> Paypal left Russia 😔

[Restrictions]: #restrictions

[Shared Config]: #shared-config

[Shared and Local Queries]: #shared-and-local-queries

[Queries with complex logic and Entity invalidation]: #queries-with-complex-logic-and-entity-invalidation

[Snapshot]: #snapshot

[IterativeSystem]: #iterativesystem

[ReactionSystem]: #reactionsystem

[Built-in query-based systems]: #built-in-query-based-systems

[Queries and Systems]: #queries-and-systems

[QueryBuilder]: #querybuilder

[Query]: #query
[System]: #system
[Entity]: #entity
[Tag]: #tag
[Component]: #component
[Installing]: #installing
[How it works?]: #how-it-works
[Inside the Tick-Knock]: #inside-the-tick-knock
[Subscription]: #subscription
[Engine]: #engine
[License]: #license
[Donation]: #donation
