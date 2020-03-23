#  corner(store).js

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
class ArrowOut{constructor(_okey){this.okey=_okey
this.reads=[]
this.updates=[]
this.deletes=[]
return this}}
class ArrowIn{constructor(_ikey){this.ikey=_ikey
this.reads=[]
this.updates=[]
this.deletes=[]
return this}}
class Algo{constructor(...args){if(args.length!==1){throw Error(`Algo.constructor : expected one and only one argument, received (${args.length}) arguments`)}
if(typeof args[0]!=='function'){throw Error(`Algo.constructor : typeof (argument provided) was not 'function'`)}
let _lambda=this.lambda=args[0]
return this}}
class Datum extends Function{toString(){return['Datum.toString/0 returned:',['a shallow copy of enumerable properties, { ... this }',{...this}],['Object.getOwnPropertyDescriptors ( this )',Object.getOwnPropertyDescriptors(this)],]}
constructor(...args){super()
this.key
this.value
this.arrows={in:{},out:{}}
this.log={reads:[],updates:[],deletes:[]}
this.cache={stale:!1,hits:[],misses:[]}
switch(args.length)
{case 0:return
case 1:switch(typeof args[0])
{case 'string':this.key=args[0]
return this
case 'object':this.key=Object.keys(args[0])[0]
this.value=args[0][this.key]
return this
default:throw Error(`Datum::constructor/1 called on n, where
                        (typeof n) is not 'string' or 'object';  branch undefined`)}
default:throw Error(`datum.constructor/n called, branch for this arity is undefined.`)}}}
class Graph extends Datum{toString(){return['Graph.toString/0 returned:',super.toString()]}
constructor(...args){super()
this.key=''
this.value={}
this.datumHandler={apply:this.datumHandlerApply,deleteProperty:this.datumHandlerDeleteProperty,get:this.datumHandlerGet,set:this.datumHandlerSet}
this.graphHandler={...this.datumHandler,apply:this.graphHandlerApply,}
this.proxy=new Proxy(this,this.graphHandler)
switch(args.length){case 0:return{graph:this,server:this.proxy}
case 1:switch(args[0]){case 'server':return this.proxy
case 'graph':return this
default:throw Error(`Graph.constructor/1 called, the argument
                        was not understood.`)}
break
default:throw Error(`Graph.constructor/n called, where no branch was
                defined for arity-n.`)}}
deleteVertex(key){if(!(key in this.value)){return!0}
if((typeof this.value[key]('datum').value=='object'))
{for(const loopKey in this.value){if(loopKey.startsWith(key+'.')){if(!this.deleteVertex(loopKey)){return!1}}}}
delete this.value[key]
return!(key in this.value)}
getVertex(key){if(!(key in this.value))
{return undefined}
let value=this.value[key]()
if(value instanceof Algo){return value.lambda(this.proxy)}
else if(typeof value=='object')
{return this.value[key]}
else{return value}}
setVertex(...args){let datum
switch(args.length)
{case 0:throw Error(`graph.setVertex/0 called; unsupported arity.`)
case 1:console.warn(`graph.setVertex/1 : rewrite & test for this branch`)
let key=args[0]
datum=new Datum(key)
this.value[datum.key]=new Proxy(datum,this.datumHandler)
break}
let key=args[0]
let value=args[1]
if(!this.deleteVertex(key)){return!1}
datum=new Datum({[key]:value})
if(typeof value=='object'){for(const subKey in value){let compoundKey=key+'.'+subKey
if(!this.setVertex(compoundKey,value[subKey]))
{return!1}}}
if(value instanceof Algo){let keySniffer=new Proxy({},{get:(ksTarg,ksProp,ksRcvr)=>{if(!('causal' in datum.arrows.in)){datum.arrows.in.causal=[]}
datum.arrows.in.causal.push(new ArrowIn(ksProp))
let dependencyDatum=this.value[ksProp]('datum')
if(!('causal' in dependencyDatum.arrows.out)){dependencyDatum.arrows.out.causal=[]}
dependencyDatum.arrows.out.causal.push(new ArrowOut(key))},set:(ksTarg,ksProp,ksVal,ksRcvr)=>{if(!('causal' in datum.arrows.out)){datum.arrows.out.causal=[]}
datum.arrows.out.causal.push(new ArrowOut(ksProp))
if(!(ksProp in this.value)){this.setVertex(ksProp,undefined)}
let dependentDatum=this.value[ksProp]('datum')
if(!('causal' in dependentDatum.arrows.in)){dependencyDatum.arrows.in.causal=[]}
dependentDatum.arrows.in.causal.push(new ArrowIn(key))}})
value.lambda(keySniffer)}
this.value[datum.key]=new Proxy(datum,this.datumHandler)
return(this.value[datum.key]()==args[1])?!0:!1}
datumHandlerApply=(targ,thisArg,args)=>{switch(args.length){case 0:let datum=targ
return typeof datum.value=='object'?this.recoverEnumerableProperties(datum):datum.value
case 1:switch(args[0]){case 'unproxy':return targ
case 'gopds':return Object.getOwnPropertyDescriptors(this)
case 'datum':return targ
default:throw Error(`graph.datumHandleApply/1 : the argument was
                        not understood`)}
default:throw Error(`graph.datumHandlerApply/n, where arity-n has no defined branch`)}}
datumHandlerDeleteProperty=(targ,prop)=>{return this.deleteVertex(prop)}
datumHandlerGet=(targ,prop,rcvr)=>{let compoundKey=(targ.key?targ.key+'.':'')+prop
return this.getVertex(compoundKey)}
datumHandlerSet=(targ,prop,val,rcvr)=>{let compoundKey=(targ.key?targ.key+'.':'')+prop
return this.setVertex(compoundKey,val)}
graphHandlerApply=(targ,thisArg,args)=>{switch(args.length){case 0:let datum=targ
return typeof datum.value=='object'?this.recoverEnumerableProperties(datum):datum.value
case 1:switch(args[0]){case 'unproxy':return targ
case 'gopds':return Object.getOwnPropertyDescriptors(this)
case 'graph':return targ
case 'server':return this.proxy
default:throw Error(`graph.graphHandlerApply/1 called;
                        the argument was not understood`)}
default:throw Error(`graph.graphHandlerApply/n called, where no
                branch is defined for arity-n`)}}
graphHandlerDeleteProperty=(targ,prop)=>{return this.datumHandlerDeleteProperty(targ,prop)}
graphHandlerGet=(targ,prop,rcvr)=>{return this.datumHandlerGet(targ,prop,rcvr)}
graphHandlerSet=(targ,prop,val,rcvr)=>{return this.datumHandlerSet(targ,prop,val,rcvr)}
recoverEnumerableProperties(object){if(object instanceof Datum){for(const key in this.value){if(key.startsWith(object.key+'.')){let propKey=key.slice(object.key.length+1)
if(!propKey.includes('.')){object.value[propKey]=this.value[key]()}}}
return object.value}
else{for(const key in this.value){if(!key.includes('.')){object[key]=this.value[key]()}}
return object}}}
globalThis.Algo=Algo
globalThis.Datum=Datum
globalThis.Graph=Graph
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
