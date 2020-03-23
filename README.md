# Project : corner(store).js

An introduction via pretty slides is found
[here](https://docs.google.com/presentation/d/1esYQhtpjGjE9KsLmrdkGLD642FO-jTEeEuHlg4h6MWk/edit#slide=id.p).

This is a datastore frontend which I’ve developed for personal use.

# Project : Design Goals

- Reactive
- Keystroke-minimal
- Easy to Run
  - Pure Javascript - no illegal syntax, sigils, brackets, or pre-compilation needed.
  - Pop the module into a browser, run code without a buildstep. 
  - It can be compiled, built, performance enhanced, what-have-you, later.

# Project : Minified... just run it now! 

## Here is the code.

You can paste it into your console and follow along the next slides.

```javascript
class ArrowOut{constructor(e){return this.okey=e,this.reads=[],this.updates=[],this.deletes=[],this}}class ArrowIn{constructor(e){return this.ikey=e,this.reads=[],this.updates=[],this.deletes=[],this}}class Algo{constructor(...e){if(1!==e.length)throw Error(`Algo.constructor : expected one and only one argument, received (${e.length}) arguments`);if("function"!=typeof e[0])throw Error("Algo.constructor : typeof (argument provided) was not 'function'");this.lambda=e[0];return this}}class Datum extends Function{constructor(...e){switch(super(),this.key,this.value,this.arrows={in:{},out:{}},this.log={reads:[],updates:[],deletes:[]},this.cache={stale:!1,hits:[],misses:[]},e.length){case 1:switch(typeof e[0]){case"string":return this.key=e[0],this;case"object":return this.key=Object.keys(e[0])[0],this.value=e[0][this.key],this;default:throw Error("Datum::constructor/1 called on n, where\n                        (typeof n) is not 'string' or 'object';  branch undefined")}default:throw Error("datum.constructor/n called, branch for this arity is undefined.")}}}class Graph extends Function{constructor(...e){switch(super(),this.vertices={},this.datumHandler=this.getDatumHandler(),this.graphHandler=this.getGraphHandler(),this.server=new Proxy(this,this.graphHandler),e.length){case 0:return{graph:this,server:this.server};case 1:switch(e[0]){case"server":return this.server;case"graph":return this;default:throw Error("Graph.constructor/1 called, the argument\n                        was not understood.")}break;default:throw Error("Graph.constructor/n called, where no branch was\n                defined for arity-n.")}}deleteVertex(e){if(!(e in this.vertices))return!0;if("object"==typeof this.vertices[e]("datum").value)for(const t in this.vertices)if(t.startsWith(e+".")&&!this.deleteVertex(t))return!1;return delete this.vertices[e],!(e in this.vertices)}getVertex(e){if(!(e in this.vertices))return;let t=this.vertices[e]();return t instanceof Algo?t.lambda(this.server):"object"==typeof t?this.vertices[e]:t}setVertex(...e){let t;switch(e.length){case 0:throw Error("graph.setVertex/0 called; unsupported arity.");case 1:console.warn("graph.setVertex/1 : rewrite & test for this branch");let r=e[0];t=new Datum(r),this.vertices[t.key]=new Proxy(t,this.datumHandler)}let r=e[0],s=e[1];if(!this.deleteVertex(r))return!1;if(t=new Datum({[r]:s}),"object"==typeof s)for(const e in s){let t=r+"."+e;if(!this.setVertex(t,s[e]))return!1}if(s instanceof Algo){let e=new Proxy({},{get:(e,s,n)=>{"causal"in t.arrows.in||(t.arrows.in.causal=[]),t.arrows.in.causal.push(new ArrowIn(s));let a=this.vertices[s]("datum");"causal"in a.arrows.out||(a.arrows.out.causal=[]),a.arrows.out.causal.push(new ArrowOut(r))}});s.lambda(e)}return this.vertices[t.key]=new Proxy(t,this.datumHandler),this.vertices[t.key]()==e[1]}getDatumHandler(){let e=this;return{apply:function(t,r,s){switch(s.length){case 0:let r=t;return"object"==typeof r.value?e.recoverEnumerableProperties(r):r.value;case 1:switch(s[0]){case"datum":return t;default:throw Error("graph.datumHandler.apply/1 : the argument was\n                                not understood")}default:throw Error("graph.datumHandler.apply/n, where arity-n has no defined branch")}},deleteProperty:function(t,r){return e.deleteVertex(r)},get:function(t,r,s){return e.getVertex(t.key+"."+r)},set:function(t,r,s,n){return e.setVertex(t.key+"."+r,s)}}}getGraphHandler(){let e=this;return{apply:function(t,r,s){switch(s.length){case 0:return e.recoverEnumerableProperties({});case 1:switch(s[0]){case"graph":return e;case"server":return e.server;default:throw Error("graph.graphHandler/1 called;\n                                the argument was not understood")}default:throw Error("graph.graphHandler/n called, where no\n                        branch is defined for arity-n")}},deleteProperty:function(t,r){return e.deleteVertex(r)},get:function(t,r,s){return e.getVertex(r)},set:function(t,r,s,n){return e.setVertex(r,s)}}}recoverEnumerableProperties(e){if(e instanceof Datum){for(const t in this.vertices)if(t.startsWith(e.key+".")){let r=t.slice(e.key.length+1);r.includes(".")||(e.value[r]=this.vertices[t]())}return e.value}for(const t in this.vertices)t.includes(".")||(e[t]=this.vertices[t]());return e}}globalThis.Algo=Algo,globalThis.Datum=Datum,globalThis.Graph=Graph;
```
# Transcript from Demo Slides

## slide

Here's all the demo code so far.

```javascript
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
```

## slide

A central concept to this tool is graphs. Graphs data structures have become
very popular, with the rise of social networking and recommendation engines.

But application data is often not structured as graphs because the languages
developers use do not come with built-in graph data structures. 

For example, JavaScript has Arrays, and Objects, and Weak Maps, and Sets, but
all of these are simply nested trees of data. This is un-brainlike, and
generally it feels restrictive.

#### The **Graph.constructor/0** will return a bunch of useful things, but we don’t need
all of them for the demo.

## slide

#### **Graph.constructor/1** can give you a simple server, to get started.

The real graph data is a few layers beneath, but what you get here is a proxy,
which intercepts your calls to the graph data.

From the developer’s point of view, the graph server is a simple user-interface
to a datastore.

The developer doesn’t need to know how the datastore works.

Underneath, it’s just JavaScript.

## slide

#### For this demo, the variable **G** refers to our graph server.

G is very easy to use.

#### Here we **set** two literal values in G.

#### Then we **set** a computed value.

The Algo class is not complex. It simply functions as a type marker which tells
the proxy how to handle getters and setters.

#### Voila, if we **get** the computed value, it just works.

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

#### Use **a function call (arity 0)** to extract a tree of data from any non-leaf node
in the graph.

## slide

#### We can **call the server with arity 0** to extract the total tree.

Time for a peek under the hood.

We can **call the server with arity 1** to access the un-proxied target Graph
instance. But most developers would probably not bother, most of the time.

But if you take an interest in how this is working, you will note that the
server deconstructs every single POJO tree when it is inserted to the graph.

#### The graph data is actually stored in a flat index of compound keys.

## end of slides
