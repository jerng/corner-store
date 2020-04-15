|Contents|Sub-section
|:---|:---
|[Quick Start](#quick-start)
|   |[Purpose of this Software](#purpose-of-this-software)
|   |[Current Release Stage](#current-release-stage-alpha)
|   |[Modules](#modules)
|[Application Programming Interface](#application-programming-interface)
|   |[Creating a Store](#creating-a-store)
|   |[Setting *Datum* and *Script* Values](#setting-datum-and-script-values)
|   |[Getting Trees Out](#getting-trees-out)
|   |[TMI: Internal Representation of Data](#tmi-internal-representation-of-data)
|   |[Recap](#recap)
|   |[Creating a Monitor](#creating-a-monitor)
|   |[Visual Recap](#visual-recap)
|   |[Visualising the Cache State](#visualising-the-cache-state)
|   |[Visualising Reactive Data Structures](#visualising-reactive-data-structures-i)
|[Motivation, Design, Production Decisions](#motivation-design-production-decisions)
|   |[Metaprogramming via Proxy](#metaprogramming-via-proxy)
|   |[Minimalism in Tooling](#minimalism-in-tooling)
|   |[Automatic Reduction and Reactivity](#user-content-automatic-reduction-and-reactivity-6)
|   |[Supporting Emergent Data Structures](#supporting-emergent-data-structures)
|[Footnotes](#footnotes)

# Quick Start

### Purpose of this Software

*The __store__ organises human memory during Javascript application development.*

###### Current Release Stage : **`ALPHA`**

-   **User Advice :** APIs and variables names are not guaranteed to be stable.
    But the API surface is very small, so feel free to just play with it, like a
    toy. Maybe you will find something useful. Maybe not.

-   **Developer Advice :**  Tests exist; documentation has barely begun. If you
    feel inclined to get involved, feel free to do so with or without asking me
    questions or sending me comments. Use Github for public comms whenever
    possible, that will reduce repetition. I should be able to update docs for
    urgent sections within a day, whenever needed.

`README.md` should tell you how to use this software, if you would like to try it
out. Beyond that, [a little will be be
written](#motivation-design-production-decisions) about the motivations for the
production of this software, and how those motivations have influenced design
decisions to-date. A very limited amount of expertise has gone into development
so far, so please bear with the infancy of the project.

## Modules

#### `store.js`

-   This file exports two classes, `Graph` and `Script`.
-   A new graph *store* may be obtained with the expression `S = new Graph (
    'store' )`.
-   Simply `include` this file, or use it as a `<script/>`. 

#### `monitor.js`

-   This file exports one method, `monitor`.
-   A new graph *monitor* may be rendered to an HTML document, with the
    expression `monitor ( S )`, where S is a graph *store*.
-   Simply `include` this file, or use it as a `<script/>`. 
    -   This file has `store.js` as a dependency, you may want to put
        them in the same directory.
    -   This file also has the [`D3: Data-Driven
        Documents`](https://github.com/d3/d3) library as a dependency.  You may
        want to put it in `./lib/third-party/d3.v5.js` where this file is in
        `.`. [[1](#1)]

# Application Programming Interface

Please walk along with `demo.html`.

1.  ## Creating a Store
    
    ```javascript
    CS = new Graph ( 'store' )
    ```

    ![Creating a Store](https://jerng.github.io/corner-store/images/demo-slide-01\(2020-04-15\).jpg)

    ---

2.  ## Setting Datum and Script Values 

    ```javascript
    CS.a = 1
    CS.b = 2
    CS.c = new Script ( g => g.a + g.b )
    CS.c
    ```

    ![Setting Datum and Script Values](https://jerng.github.io/corner-store/images/demo-slide-02\(2020-04-15\).jpg)

    ---

3.  ## Getting Trees Out

    ```javascript
    CS.d = { m:1, n:2, o:3 }
    CS.d.n = [ 77, 88, 99 ]
    CS.d
    CS.d ()
    ```

    ![Getting Trees Out](https://jerng.github.io/corner-store/images/demo-slide-03\(2020-04-15\).jpg)

    ---

4.  ## TMI: Internal Representation of Data

    ```javascript
    CS ()
    CS ('graph')
    ```

    ![TMI: Internal Representation of Data](https://jerng.github.io/corner-store/images/demo-slide-04\(2020-04-15\).jpg)

    ---

5.  ## Recap 

    ```javascript
    CS = new Graph ( 'store' )
    CS.a = 1
    CS.b = 2
    CS.c = new Script ( g => g.a + g.b )
    CS.c
    CS.d = { m:1, n:2, o:3 }
    CS.d.n = [ 77, 88, 99 ]
    CS.d
    CS.d ()
    CS ()
    CS ( 'graph' )
    ```

    ![Recap](https://jerng.github.io/corner-store/images/demo-slide-05\(2020-04-15\).jpg)

    ---

6.  ## Creating a Monitor 

    ```javascript
    Monitor.monitor ( CS )
    ```

    ![Creating a Monitor](https://jerng.github.io/corner-store/images/demo-slide-06\(2020-04-15\).jpg)

    ---

7.  ## Visual Recap 

    ```javascript
    CS = new Graph ( 'store' )
    Monitor.monitor ( CS )
    CS.a = 1
    CS.b = 2
    CS.c = new Script ( g => g.a + g.b )
    CS.c
    CS.d = { m:1, n:2, o:3 }
    CS.d.n = [ 77, 88, 99 ]
    CS.d
    CS.d ()
    CS ()
    CS ( 'graph' )
    ```

    ![Visual Recap](https://jerng.github.io/corner-store/images/demo-slide-07\(2020-04-15\).jpg)

    ---

8.  ## Visualising the Cache State 

    ```javascript
    CS.iHaveSources = new Script ( s => s.a * 2 )
    CS.iHaveSources
    ```

    ![Visualising the Cache State](https://jerng.github.io/corner-store/images/demo-slide-08\(2020-04-15\).jpg)

    ---

9.  ## Visualising Reactive Data Structures (i) 

    ```javascript
    CS.sideEffectedVertex = undefined
    CS.reactiveVertex = new Script (

        s => { s.sideEffectedVertex = s.a + 2 },

        {   reactive    : true,
            getHandler  : false
        } 
    )

    ```

    ![Visualising Reactive Data Structures (i)](https://jerng.github.io/corner-store/images/demo-slide-09\(2020-04-15\).jpg)

    ---

    ![Visualising Reactive Data Structures (ii](https://jerng.github.io/corner-store/images/demo-slide-10\(2020-04-15\).jpg)
    
---

# Motivation, Design, Production Decisions

... and some discoveries along the ways of implemention.

1.  ### Metaprogramming via `Proxy`

    By the heuristic of [minimalism](#minimalism-in-tooling), the
    entrypoint for the framework API is a single proxied object, which we can refer
    to generically as a *store*, hence the project's choice of name. [[5](#5)]

2.  ### Minimalism in Tooling

    A key goal of this project is to minimise the number of tools involved in
    taking the development of a Javascript software application, from design
    draught, to webscale robustness. Everyone owns a web browser (or three). So
    the 'normal' path to acquiring a mastery of software craftsmanship *should*
    begin *in the web browser*.[[2](#2)]

    -   Vanilla [Javascript](https://tc39.es/ecma262/) - no special syntax,
        sigils, brackets, templates, or pre-compilation needed.
    -   It can be compiled, built, performance enhanced, what-have-you, later.
        Simply write Scripts into your Graph, which perform the necessary
        adjustments to other Scripts, or to blocks of text. If you want
        non-specification syntax, or features, you are encouraged to *learn how
        to parse it by yourself*. The store is a [helper for the organisation of
        your mind](#purpose-of-this-software).
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

    Javascript didn't make room for directed graphs to be first-class citizens.
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
##### Footnotes

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
