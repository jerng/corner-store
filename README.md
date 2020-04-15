##### Purpose of this Software

**The _store_ is a helper for the organisation of your mind.**

###### Current Release Stage : **`ALPHA`**

-   **User Advice :**       APIs and variables names are not guaranteed to be
                            stable. But the API surface is very small, so feel
                            free to just play with it, like a toy. Maybe you
                            will find something useful. Maybe not.

-   **Developer Advice :**  Tests exist; documentation has barely begun. If you
                            feel inclined to get involved, feel free to do so
                            with or without asking me questions or sending me
                            comments. Use Github for public comms whenever
                            possible, that will reduce repetition. I should be
                            able to update docs for urgent sections within a
                            day, whenever needed.

README.md should tell you how to use this software, if you would like to try it
out. Beyond that, [a little will be be
written](#motivation-design-production-decisions) about the motivations for the
production of this software, and how those motivations have influenced design
decisions to-date.

# Modules

#### `corner-store.js`

-   This file exports two classes, `Graph` and `Script`.
-   A new graph *store* may be obtained with the expression `S = new Graph (
    'store' )`.
-   Simply `include` this file, or use it as a `<script/>`. 

#### `monitor.js`

-   This file exports one method, `monitor`.
-   A new graph *monitor* may be rendered to an HTML document, with the
    expression `monitor ( S )`, where S is a graph *store*.
-   Simply `include` this file, or use it as a `<script/>`. 
    -   This file has `corner-store.js` as a dependency, you may want to put
        them in the same directory.
    -   This file also has the [`D3: Data-Driven
        Documents`](https://github.com/d3/d3) library as a dependency.  You may
        want to put it in `./lib/third-party/d3.v5.js` where this file is in
        `.`. [[1](#1)]

# Application Programming Interface



# Motivation, Design, Production Decisions

... and some discoveries along the ways of implemention.

1.  ### Metaprogramming via `Proxy`

    By the heuristic of [minimalism in tooling](#minimalism-in-tooling), the
    entrypoint for the framework API is a single proxied object, which we can refer
    to generically as a *store*, hence the project's choice of name. [[5](#5)]

2.  ### Minimalism in Tooling

    A key goal of this project is to minimise the number of tools involved in
    taking the development of a Javascript software application, from design
    draught, to webscale robustness. Everyone owns a web browser (or three). So
    the 'normal' path to acquiring a mastery of software craftsmanship *should*
    begin *in the web browser*.[[2](#2)]

    -   Pure Javascript - no special syntax, sigils, brackets, or
        pre-compilation needed.
    -   It can be compiled, built, performance enhanced, what-have-you, later.
        Simply write Scripts into your Graph, which perform the necessary
        adjustments to other Scripts, or to blocks of text. If you want
        non-specification syntax, or features, you are encouraged to *learn how
        to parse it by yourself*. The store is a helper for the organisation of
        your mind.
    -   For now, pop the module into a browser, run code without a buildstep. 

3.  ### Automatic Reduction and Reactivity [[6](#6)]

    ###### Implementation Details

    This is achieved by implementing `traits` in our Script instance vertices.
    Traits denote the *rules* which govern the operation of each Script instance
    vertice. Some key traits have been implemented, while others remain on the
    whiteboard.

    | Trait       | Done?|      Intended Usage 
    |-------------|------|-------------------
    |hasSources   | YES  |can read from graph
    |hasSinks     | YES  |can write to graph
    |cached       | YES  |lazy updates
    |reactive     | YES  |active updates, on source changes
    |setHandler   | YES  |code triggered by proxyHandler.set
    |getHandler   | YES  |code triggered by proxyHandler.get
    |-------------|------|-------------------
    |firmSources  | NO   |blocks source deletion
    |firmSinks    | NO   |blocks sink deletion
    |exclusiveGets| NO   |monopolises source reads
    |exclusiveSets| NO   |monopolises sink writes

4.  ### Supporting Emergent Data Structures

    Javascript did't make room for directed graphs to be first-class citizens.
    To be fair, very few languages do. (And to be honest, I'm not quite sure what
    this would mean.) But directed graphs do need to be front and centre in our
    thought processes as programmers, because the world we are programming about
    in inherently full of these data structures.

    To take it to one extreme, consider the [physics project at
    Wolfram-Alpha](https://writings.stephenwolfram.com/2020/04/finally-we-may-have-a-path-to-the-fundamental-theory-of-physics-and-its-beautiful/).

    ###### Implementation Details

    -   Vertices in the graph represent data points. Each vertice is mechanised
        as a `Datum` - this class is not yet provided to the framework user. It
        has two child classes which are, however, provided as part of the
        framework's API.

        1.  `Graph` is an extension of `Datum`, and this special class of datum
            is the underlying class which coordinates **all vertices** (data 
            points) in our graphs. The graph 'store' object is a *proxied* 
            instance of the Graph class.

        2.  `Script` is an extension of `Datum`, and this special class of datum
            is the underlying class which represents **those vertices** (data
            points) in our graphs whch are of a **dimensionality greater than
            1** in the sense that each such datum potentially represents yet
            another graph (which may be contained within our initial graph, or
            simply not documented at all).

        It is possible to create multiple Graph instances per realm. And it is
        possible to refer to subsets of a Graph instance's via variable names.

        Putting Graph instances into Graph instances is an intriguing
        opportunity which has not yet been studied closely. Please try it and
        complain about the consequences.

        Please also try zany things like programming mini neural networks into
        the store just to see how bad the performance is. At least they might be
        fun to watch in the monitoring tool.

---

###### [1]
Mr. Bostock has put a remarkable amount of work into creating and maintaining
D3. This should be duly applauded.

-   Personally, I found the documentation hard to ingest, and that the
    proliferation of versions and examples across this ecosystem was somewhat
    confusing. A friend suggested that it may be useful in the future to write a
    wrapper called D4: D3 for Dummies... I may have to take that seriously if I
    acquire some affluence to pursue this.

###### [2]

For all its manifest progress, computing remains somewhat divisive, between what
is easy to learn, and what is powerful to deploy. Fortunately, many divides
can be easily bridged with just a little middleware. This piece of software aims
to do just that.

The 'industry standard' for using ECMAScript in 2020 incorporates toolchains and
buildsteps and arbitrary syntaxes deemed superior by various parties, then
compiled to standard Javascript runtimes. But the runtime itself is often
sidelined - instead of figuring out how to work within its limitations, the
ecosystem glorifies working around them.

If you feel similarly dank about tooling proliferation, but still require a
semblance of professional allure, consider this Facebook-owned project to
produce a unified toolchain, led by the [creator of
Babel](https://twitter.com/sebmck):
[Rome](https://romejs.dev/).

On a more selfish level, I currently do not work in professional software.
Instead I find myself piloting a rather traditional sort of business - a cafe!
However, we do want to be a modern corporation, and to be minimally competant in
our delivery of basic software, and hardware, as befits the times. So how should
a tiny organisation like ours approach such endeavours? 

At the point in 2019 at which I sought to start building internal websites and
apps, I did a quick review of the Javascript ecosystem which I hadn't touched
since ... 2015 ... and concluded that it was in a bit of a Cambrian explosion.
While browser compatibility has stablised remarkably since 2010, language
features had creeped wholesale into the spec, and a massive Framework War of
sorts was ongoing.

Given our extremely limited corporate resources, I decided to sidestep as many
external dependencies as possible, and to focus on curating our own long-term
stack from scratch. This served both as an exercise is understanding the state
of Javascript (which I had never mastered) and in turn this delivers some
necessary foundations for my company's work.

###### [3]

Due to an abundance of things in the Javascript universe which bear the name
'node', from HTML DOM entities to serverside frameworks, this specific term is
eschewed here, in favour of the term 'vertex' whenever we refer to vertices in
our graph store.

###### [4]

Due to the naming of [arrow function
expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions),
we eschew the term 'arrow' in favour of 'pointer' whenever referring to directed
edges in our graph.

###### [5]

The introduction of
[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
allows Javascript developers to intercept certain operations on certain objects.
Its limitation is that it cannot intercept most [CRUD
operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) upon
just any object, instead it can only intercept CRUD operations upon the *keyed
properties* of objects. This fundamentally limits the ways in which we can
augment the ergonomics of using proxies. If we want to use Proxy, then our
(programming) user-interface designs **__must__** revolve around proxied
objects. 

###### [6]

One of the defining factors of any mature system is its ability to multiply
force. The consumer's term for this is, 'it just works', and the question then
is one of how much magic is too much? At some point, hidden layers obscure the
nature of the thing-in-itself ... here of course, we are applying these
questions to Javascript as a language and runtime.  *Abstraction ===
Convenience*.

###### [7]

A key paradigm introduced, is the decoupling of namespaces from data structures.
In our graph store, all objects are namespaced *as if* they are descendents of a
single Javascript object. However, that object operates under-the-hood as a
helper of almost server-like complexity, allowing for the creation of *labeled
pointers* [[4](#4)] between any two *vertices* [[3](#3)] in the graph.

Therefore from a framework user's point of view, namespaces for objects in the
store are merely an indicical convenience, taking the form of a
[tree](https://en.wikipedia.org/wiki/Tree_(graph_theory)). 

What we are really talking and thinking about with our store, is modelling each
data point in our application as a vertex, in a [disconnected graph which may or
may not contain
cycles](https://www.quora.com/Can-a-disconnected-graph-contain-cycles). 










#  Previous Documentation Below

An introduction via pretty slides is found
[here](https://docs.google.com/presentation/d/1esYQhtpjGjE9KsLmrdkGLD642FO-jTEeEuHlg4h6MWk/edit#slide=id.p).

This is a datastore frontend which I’ve developed for personal use.

#  Design Goals

#  Minified... just run it now! 

## Here is the code.

You can paste it into your console and follow along the next slides.

```javascript
class ArrowOut{constructor(a){return this.okey=a,this.reads=[],this.updates=[],this.deletes=[],this}}class ArrowIn{constructor(a){return this.ikey=a,this.reads=[],this.updates=[],this.deletes=[],this}}class Algo{constructor(...a){if(1!==a.length)throw Error(`Algo.constructor : expected one and only one argument, received (${a.length}) arguments`);if("function"!=typeof a[0])throw Error(`Algo.constructor : typeof (argument provided) was not 'function'`);this.lambda=a[0];return this}}class Datum extends Function{toString(){return["Datum.toString/0 returned:",["a shallow copy of enumerable properties, { ... this }",{...this}],["Object.getOwnPropertyDescriptors ( this )",Object.getOwnPropertyDescriptors(this)]]}constructor(...a){switch(super(),this.key,this.value,this.arrows={in:{},out:{}},this.log={reads:[],updates:[],deletes:[]},this.cache={stale:!1,hits:[],misses:[]},a.length){case 0:return;case 1:switch(typeof a[0]){case"string":return this.key=a[0],this;case"object":return this.key=Object.keys(a[0])[0],this.value=a[0][this.key],this;default:throw Error(`Datum::constructor/1 called on n, where (typeof n) is not 'string' or 'object';  branch undefined`);}default:throw Error(`datum.constructor/n called, branch for this arity is undefined.`);}}}class Graph extends Datum{toString(){return["Graph.toString/0 returned:",super.toString()]}constructor(...a){switch(super(),this.key="",this.value={},this.handlers=this.handlers(),this.datumHandler={apply:this.handlers.datumHandlerApply,deleteProperty:this.handlers.datumHandlerDeleteProperty,get:this.handlers.datumHandlerGet,set:this.handlers.datumHandlerSet},this.graphHandler={...this.datumHandler,apply:this.handlers.graphHandlerApply},this.proxy=new Proxy(this,this.graphHandler),a.length){case 0:return{graph:this,server:this.proxy};case 1:switch(a[0]){case"server":return this.proxy;case"graph":return this;default:throw Error(`Graph.constructor/1 called, the argument was not understood.`);}break;default:throw Error(`Graph.constructor/n called, where no branch was defined for arity-n.`);}}deleteVertex(a){if(!(a in this.value))return!0;if("object"==typeof this.value[a]("datum").value)for(const b in this.value)if(b.startsWith(a+".")&&!this.deleteVertex(b))return!1;return delete this.value[a],!(a in this.value)}getVertex(a){if(a in this.value){let b=this.value[a]();return b instanceof Algo?b.lambda(this.proxy):"object"==typeof b?this.value[a]:b}}setVertex(...a){let b;switch(a.length){case 0:throw Error(`graph.setVertex/0 called; unsupported arity.`);case 1:console.warn(`graph.setVertex/1 : rewrite & test for this branch`);let c=a[0];b=new Datum(c),this.value[b.key]=new Proxy(b,this.datumHandler);}let c=a[0],d=a[1];if(!this.deleteVertex(c))return!1;if(b=new Datum({[c]:d}),"object"==typeof d)for(const a in d){if(!this.setVertex(c+"."+a,d[a]))return!1}if(d instanceof Algo){let a=new Proxy({},{get:(a,d)=>{"causal"in b.arrows.in||(b.arrows.in.causal=[]),b.arrows.in.causal.push(new ArrowIn(d));let e=this.value[d]("datum");"causal"in e.arrows.out||(e.arrows.out.causal=[]),e.arrows.out.causal.push(new ArrowOut(c))},set:(a,d)=>{"causal"in b.arrows.out||(b.arrows.out.causal=[]),b.arrows.out.causal.push(new ArrowOut(d)),d in this.value||this.setVertex(d,void 0);let e=this.value[d]("datum");"causal"in e.arrows.in||(dependencyDatum.arrows.in.causal=[]),e.arrows.in.causal.push(new ArrowIn(c))}});d.lambda(a)}return this.value[b.key]=new Proxy(b,this.datumHandler),this.value[b.key]()==a[1]}handlers(){return{datumHandlerDeleteProperty:(a,b)=>this.deleteVertex(b),datumHandlerGet:(a,b)=>{let c=(a.key?a.key+".":"")+b;return this.getVertex(c)},datumHandlerSet:(a,b,c)=>{let d=(a.key?a.key+".":"")+b;return this.setVertex(d,c)},datumHandlerApply:(a,b,c)=>{switch(c.length){case 0:let b=a;return"object"==typeof b.value?this.recoverEnumerableProperties(b):b.value;case 1:switch(c[0]){case"unproxy":return a;case"gopds":return Object.getOwnPropertyDescriptors(this);case"datum":return a;default:throw Error(`graph.datumHandleApply/1 : the argument was not understood`);}default:throw Error(`graph.datumHandlerApply/n, where arity-n has no defined branch`);}},graphHandlerApply:(a,b,c)=>{switch(c.length){case 0:let b=a;return"object"==typeof b.value?this.recoverEnumerableProperties(b):b.value;case 1:switch(c[0]){case"unproxy":return a;case"gopds":return Object.getOwnPropertyDescriptors(this);case"graph":return a;case"server":return this.proxy;default:throw Error(`graph.graphHandlerApply/1 called; the argument was not understood`);}default:throw Error(`graph.graphHandlerApply/n called, where no branch is defined for arity-n`);}}}}recoverEnumerableProperties(a){if(a instanceof Datum){for(const b in this.value)if(b.startsWith(a.key+".")){let c=b.slice(a.key.length+1);c.includes(".")||(a.value[c]=this.value[b]())}return a.value}for(const b in this.value)b.includes(".")||(a[b]=this.value[b]());return a}}globalThis.Algo=Algo,globalThis.Datum=Datum,globalThis.Graph=Graph;
```
# Transcript from Demo Slides

## slide

Here's all the demo code so far.

```javascript
new Graph
G = new Graph('server')
G.a = 1
G.b = 2
G.c = new Algo ( g => g.a + g.b )
G.c
G.d = { m:1, n:2, o:3 }
G.d.n = [ 77, 88, 99 ]
G.d
G.d()
G()
G(‘graph’)
```

## slide

A central concept to this tool is graphs. Graphs data structures have become
very popular, with the rise of social networking and recommendation engines.

But application data is often not structured as graphs because the languages
developers use do not come with built-in graph data structures. 

For example, JavaScript has Arrays, and Objects, and Weak Maps, and Sets, but
all of these are simply nested trees of data. This is un-brainlike, and
generally it feels restrictive.

#### The *Graph.constructor/0* will return a bunch of useful things, but we don’t need all of them for the demo.

## slide

#### *Graph.constructor/1* can give you a simple server, to get started.

The real graph data is a few layers beneath, but what you get here is a proxy,
which intercepts your calls to the graph data.

From the developer’s point of view, the graph server is a simple user-interface
to a datastore.

The developer doesn’t need to know how the datastore works.

Underneath, it’s just JavaScript.

## slide

#### For this demo, the variable *G* refers to our graph server.

G is very easy to use.

#### Here we *set* two literal values in G.

#### Then we *set* a computed value.

The Algo class is not complex. It simply functions as a type marker which tells
the proxy how to handle getters and setters.

#### Voila, if we *get* the computed value, it just works.

ECMAScript has always been a shameful mess, and as it grows older and uglier, I
spend too much time wondering why global standards must be so hard to use.

For what it’s worth, jQuery has been a gold standard in minimalist ease of
access. Follow jQuery.

## slide

We can put anything into our graph via the server. The server behaves just like
a POJO, most of the time. But you’re about to see when it doesn’t.

In order for the server to track every single item under its namespace, it
proxies every single subobject.

But our applications don’t care about these proxies, we just want our data.

#### Use *a function call (arity 0)* to extract a tree of data from any non-leaf node in the graph.

## slide

#### We can *call the server with arity 0* to extract the total tree.

Time for a peek under the hood.

We can *call the server with arity 1* to access the un-proxied target Graph
instance. But most developers would probably not bother, most of the time.

But if you take an interest in how this is working, you will note that the
server deconstructs every single POJO tree when it is inserted to the graph.

#### The graph data is actually stored in a flat index of compound keys.

## end of slides
