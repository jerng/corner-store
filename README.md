##### Alpha: current software release stage 

-   **User advice :** APIs and variables names are not guaranteed to be stable.
-   **Developer advice :** Documentation has barely begun, but tests exist.

README.md should tell you how to use this software, if you would like to try it
out. *Furtheronto* that, a little will be be written about the motivations for
the production of this software, and how those motivations have influenced
design decisions to-date.

# Modules

#### `corner.js`
#### `corner-view.js`






























#  Previous Documentation Below

An introduction via pretty slides is found
[here](https://docs.google.com/presentation/d/1esYQhtpjGjE9KsLmrdkGLD642FO-jTEeEuHlg4h6MWk/edit#slide=id.p).

This is a datastore frontend which I’ve developed for personal use.

#  Design Goals

- Reactive
- Keystroke-minimal
- Easy to Run
  - Pure Javascript - no illegal syntax, sigils, brackets, or pre-compilation needed.
  - Pop the module into a browser, run code without a buildstep. 
  - It can be compiled, built, performance enhanced, what-have-you, later.

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
