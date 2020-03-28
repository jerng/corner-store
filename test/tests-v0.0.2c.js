import * as Corner from '../corner.js'
import * as Exam from '../lib/submodules/exam.js/exam.js'
//import * as Serl from   '../lib/serl.js'
//import * as SSON from   '../lib/sson/sson.js'

new Exam.Exam ( { 
    config : {
        expand : {
          initialContext : true,
          //tests : {
          //    legible : true,
          //    verifiable : true
          //},
          //unexpectedCode : false
        }
    },
    concerns : [ 
//*
{   test : `Graph class constructor can return a graph server.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        //console.log( SERVER )
        //console.log( SERVER ('graph') )
        return {    graphInstance   : SERVER ('graph'),
                    literalTree     : SERVER ()             }
    },
    want : 'vfun',
    vfun : (r) =>   r.graphInstance instanceof Graph
                    &&
                    r.literalTree.constructor == Object 
},
{   test : `Query graph server for key, where key has not been set.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        return SERVER.location 
    },
    want : undefined
},
{   test : `Assign value to key in server; does assignment statement return a
            normal value? Is the assigned value at Graph.value.key?`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.location = 'France'
        //console.log (SERVER('graph').value.location('datum').value)
        return  JSON.stringify ( [   SERVER.location = 'Malaysia' ,
                    SERVER('graph').value.location('datum').value
                ] )
    },
    want : JSON.stringify ( [ 'Malaysia', 'Malaysia' ] )
},
{   test : `Query graph server for key, where key has been assigned.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.location = 'Malaysia'
        return SERVER.location  
    },
    want : 'Malaysia' 
},
{   test : `Assign (undefined) to key in server; does assignment statement return a normal value?`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        return ( SERVER.testundefined = undefined )     
    },
    want : undefined 
},
{   test : `Try to set a property value, on a server key which is undefined.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        return ( SERVER.location.sublocation = 'Puchong' )
            // where SERVER.location has not been set
    },
    expectError : true
},
{   test : `Assign subkey to key in server; does assignment statement return a normal value?`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.address = {}
        return ( SERVER.address.street = 'Jalan 1' )
    },
    want : 'Jalan 1'
},
{   test : `Query server for a subkey, which has been assigned.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.address = {}
        SERVER.address.street = 'Jalan 1' 
        return ( SERVER.address.street )
    },
    want : 'Jalan 1'
},
{   test : `Assign and query a sub-sub-key in server`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.address = {}
        SERVER.address.unit = {}
        SERVER.address.unit.part1 = 'The'
        return ( SERVER.address.unit.part1 )
    },
    want : 'The'
},
{   test : `Assign, and query, lambdas and other values, at key, sub-key, and
                sub-sub-key, in the server.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.address = {}
        SERVER.address.unit = {}
        SERVER.address.unit.part2 = {}
        SERVER.address.unit.part2.part2a = {}
            SERVER.location = 'Malaysia'
            SERVER.testundefined = undefined
            SERVER.address.street = 'Jalan 1' 
            SERVER.function0 = () => 'function0 has returned'
            SERVER.address.function1 = () => 'function1 has returned'
            SERVER.address.unit.function2 = () => 'function2 has returned'
            SERVER.address.unit.part2.somethingElse = 'Home'
            SERVER.address.unit.part2.part2a.deeperKey = '1,2,3 here is a deeper key'
        return JSON.stringify ({
                0: SERVER.function0(),
                1: SERVER.address.function1(),
                2: SERVER.address.unit.function2(),
                3: SERVER.address.unit.part2.somethingElse,
                4: SERVER.address.unit.part2.part2a.deeperKey 
            }, null, 2) 
            
    },
    want :  JSON.stringify ({
                0: 'function0 has returned',
                1: 'function1 has returned',
                2: 'function2 has returned',
                3: 'Home' ,
                4: '1,2,3 here is a deeper key'
            }, null, 2)
},
  
{   test : `Tree insertion to, and extraction from, graph server.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.tree = { "address": {
                        "unit": {
                            "part2": {
                                "part2a": {
                                    "deeperKey": "1,2,3 here is a deeper key"
                                },
                                "somethingElse": "Home"
                            }
                        },
                        "street": "Jalan 1"
                    },
                    "location": "Malaysia"
                }

        return JSON.stringify ( { 
            aDatum  : SERVER.tree('datum') instanceof Datum,
            aPOJO   : SERVER.tree() 
        }, null, 2 )
    },
    want : JSON.stringify (  
        {   aDatum  : true,
            aPOJO   : {
                "address": {
                    "unit": {
                        "part2": {
                            "part2a": {
                                "deeperKey": "1,2,3 here is a deeper key"
                            },
                            "somethingElse": "Home"
                        }
                    },
                    "street": "Jalan 1"
                },
                "location": "Malaysia"
            }
        }, null, 2 )
},
{   test : `Vertex deletion.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.deletable = 'hi'
        SERVER.tree = {
            a : 1,
            b : {
                c : 2,
                d : { e : 3 } 
            } 
        } 

        return JSON.stringify ( [

            SERVER.deletable ,
            delete SERVER.deletable ,
            SERVER.deletable,

            SERVER.tree.b.d = 1,
            JSON.parse( JSON.stringify( SERVER.tree() )) , // spread operator makes a shallow copy

            SERVER.tree.b.d = [11,22,,44,,,77],
            JSON.parse( JSON.stringify( SERVER.tree() )),

            SERVER.tree.b.d = {z:1, y:2, x: {m:1, n:2} },
            JSON.parse( JSON.stringify( SERVER.tree() )),

        ] )
    },
    want : JSON.stringify ( [
        "hi",
        true,
        null,
     
        1,
        {   "a":1,
            "b":{   "c":2,
                    "d":1}},
                    
        [11,22,null,44,null,null,77],
        {   "a":1,
            "b":{   "c":2,
                    "d":[11,22,null,44,null,null,77]}},
                    
        {"z":1,"y":2,"x":{"m":1,"n":2}},
        {   "a":1,
            "b":{   "c":2,
                    "d":{   "z":1,
                            "y":2,
                            "x":{   "m":1,
                                    "n":2}}}}
    ] )
},
{   test : `Computed properties; dependency getter / puller.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        //console.log (`Before setting SERVER.computed2a`)

        SERVER.computed2a       = new Algo ( s => s.source1 + s.source2 )
        
        //console.log (`After setting SERVER.computed2a`)

        //console.log (SERVER.computed2a)

        return JSON.stringify ( {
            computedValue   :   SERVER.computed2a,
        } )
    },
    want : JSON.stringify ( {
        computedValue   :   'theFIRSTpart;theSECONDpart;'
    } )
},
{   test : `Computed properties; dependency getter / puller - also check arrows on dependents and dependencies.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed2a       = new Algo ( s => s.source1 + s.source2 )

        //console.log(`Before getting arrows.`)

        //console.log(SERVER('datum').value.computed2a('datum').arrows.in.causal[0].ikey
        //)

        let computed2aArrows    = [
            SERVER('datum').value.computed2a('datum').arrows.in.causal[0].ikey,
            SERVER('datum').value.computed2a('datum').arrows.in.causal[1].ikey 
        ]
          //console.log(`After getting arrows.`)

          //console.log (SERVER('datum').value
          //                            .source1('datum')
          //                            .arrows.out.causal[0].okey
          //)

        return JSON.stringify ( {
            computedValue   :   SERVER.computed2a,
            computed2aArrows:   computed2aArrows,
            source1Arrow    :   SERVER('datum').value
                                    .source1('datum')
                                    .arrows.out.causal[0].okey,
            source2Arrow    :   SERVER('vertices')
                                    .source2('datum')
                                    .arrows.out.causal[0].okey,
        } )
    },
    want : JSON.stringify ( {
        computedValue   :   'theFIRSTpart;theSECONDpart;',
        computed2aArrows:   [ 'source1', 'source2' ],
        source1Arrow    :   'computed2a',
        source2Arrow    :   'computed2a'
    } )
},
{   test : `Computed properties; dependency getter / puller - system should complain if dependencies are not yet defined.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        //SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed2a       = new Algo ( s => s.source1 + s.source2 )
    },
    expectError: true
},
{   test : `Computed properties; dependent setter / pusher : 
- pushed computation should not be written until the the Algo is run; 
- the Algo is run when the Algo's Datum is read (gotten/get);`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed3 = new Algo ( s => { 

            // pull
            let computed = s.source1 + s.source2
            
            //console.log (`IN ALGO: BEFORE PUSH`) 

            // push
            s.sink4 = `Yo mama, I got two parts : ${computed}`
            
            //console.log (`IN ALGO: AFTER PUSH`) 

            return computed
        } ) 
        
        //console.log( SERVER('vertices').sink4('unproxy').arrows.in )

        return JSON.stringify ( {
            sink4Before     : SERVER.sink4,
            computed3       : SERVER.computed3,
            sink4After      : SERVER.sink4,
        } )
    },
    want : JSON.stringify ( {
        sink4Before         : undefined,
        computed3           : `theFIRSTpart;theSECONDpart;`,
        sink4After          : `Yo mama, I got two parts : theFIRSTpart;theSECONDpart;`,
    } )
},
{   test : `Computed properties; dependent setter / pusher : 
- pushed computation should not be written until the the Algo is run; 
- the Algo is run when the Algo's Datum is read (gotten/get); 
- also check arrows on dependents and dependencies`, 
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed3 = new Algo ( s => { 

            // pull
            let computed = s.source1 + s.source2
            
            //console.log (`IN ALGO: BEFORE PUSH`) 

            // push
            s.sink4 = `Yo mama, I got two parts : ${computed}`
            
            //console.log (`IN ALGO: AFTER PUSH`) 

            return computed
        } ) 
        
        //console.log( SERVER('vertices').sink4('unproxy').arrows.in )

        return JSON.stringify ( {
            sink4Before     : SERVER.sink4,
            computed3       : SERVER.computed3,
            sink4After      : SERVER.sink4,
            computed3Arrows :   [   SERVER('datum').value
                                        .computed3('datum').arrows.in.causal[0].ikey,
                                    SERVER('datum').value
                                        .computed3('datum').arrows.in.causal[1].ikey 
            ],
            source1Arrow    :   SERVER('datum').value
                                    .source1('datum')
                                    .arrows.out.causal[0].okey,
            source2Arrow    :   SERVER('vertices')
                                    .source2('datum')
                                    .arrows.out.causal[0].okey,
            sink4Arrow      :   SERVER('vertices')
                                    .sink4('datum')
                                    .arrows.in.causal[0].ikey
        } )
    },
    want : JSON.stringify ( {
        sink4Before         : undefined,
        computed3           : `theFIRSTpart;theSECONDpart;`,
        sink4After          : `Yo mama, I got two parts : theFIRSTpart;theSECONDpart;`,
        computed3Arrows     : [ 'source1', 'source2' ],
        source1Arrow        : 'computed3',
        source2Arrow        : 'computed3',
        sink4Arrow          : 'computed3'

    } )
},
{   test : `graph() and datum() should eject the same thing`,
    code : function () {

        let g = new Graph('server')
        let h = new Graph('server')

    //console.warn ( 'Prepare DATUM', g.a = {}, g.a.i = 4, g.a.j = 5, g)
    //console.warn ( 'Apply DATUM', g.a() )
    //
    //console.warn ( 'Prepare SERVER', h.i = 4, h.j = 5, h)
    //console.warn ( 'Apply SERVER', h())

        g.a = {}, g.a.i = 4, g.a.j = 5, g

        g.a()

        h.i = 4, h.j = 5, h
        
        h()

        return  JSON.stringify( {
                    applyDatum : g.a(),
                    applyGraph : h()
                } ) 
    },
    want :  JSON.stringify( {
        applyDatum: {
            i:4,
            j:5
        },
        applyGraph: {
            i:4,
            j:5
        },
    } )
},
{   test : `Sourcing subkeys in Algos`,
    code : function () {

        let g = new Graph('server')
        g.h = new Algo ( e => e.h.i + e.h.j )

        return JSON.stringify( g() ) 
    },
    expectError : true
},
{   test : `Tree insertion should handle Algos smoothly; Algos should be handled
smoothly by tree extraction; caching works? Lazy reads?`,
    code : function () {

        let G = new Graph('server')

        G.a = 1
        G.b = 2

        G.m = new Algo ( e => e.a + e.b )
        G.n = { o: new Algo ( e => e.a + e.b ) }

        //console.log ( G.n.o ) 

        return JSON.stringify( G() ) 
    },
    want : JSON.stringify ( {
        a: 1,
        b: 2,

        m: 3,
        n: {
            o : 3
        },

      //y: 3,
      //z: 3

    } )
},
{   test : `Algo.trait: getHandler`,
    code : function () {
        let SERVER = new Graph ('server')
        SERVER.a = 1

        SERVER.b = new Algo ( s => ( s.a + 1 ) )
        //console.warn (SERVER.b)

        SERVER.c = new Algo ( s => ( s.a + 1 ), { getHandler: false } )
        //console.warn (SERVER.c)

        return JSON.stringify ( [ SERVER.b, SERVER.c ] )
    },
    want : JSON.stringify ( [ 2, undefined ] ) 
},
{   test : `Algo.trait: cached`,
    code : function () {
        let SERVER = new Graph ('server')
        SERVER.a = 1

        SERVER.b = new Algo ( s => ( s.a + 1 ) )
        SERVER('vertices').b('datum').stale = false

      //console.warn (SERVER('vertices').b('datum').stale)
      //console.warn (SERVER('vertices').b('datum').value)
      //console.warn (SERVER('vertices').b('datum').lambda)
      //console.warn (SERVER('vertices').b('datum').traits.cached)
      //console.warn (SERVER.b)
      //console.warn (SERVER('vertices').b('datum').stale)
      //console.warn (SERVER('vertices').b('datum').value)

        SERVER.c = new Algo ( s => ( s.a + 1 ), { cached : false } )
        SERVER('vertices').c('datum').stale = false
      
      //console.warn (SERVER('vertices').c('datum').stale)
      //console.warn (SERVER('vertices').c('datum').value)
      //console.warn (SERVER('vertices').c('datum').lambda)
      //console.warn (SERVER('vertices').c('datum').traits.cached)
      //console.warn (SERVER.c)
      //console.warn (SERVER('vertices').b('datum').stale)
      //console.warn (SERVER('vertices').c('datum').value)

        let datumB = SERVER('vertices').b('datum')
        let datumC = SERVER('vertices').c('datum')

        return JSON.stringify ( {
            defaultCachedStaleFlagBefore    : datumB.stale  == false,
            defaultCachedValueBefore        : datumB.value  == undefined,

                defaultCachedGetResult          : SERVER.b      == undefined,
                defaultCachedStaleFlagAfter     : datumB.stale  == false,
                defaultCachedValueAfter         : datumB.value  == undefined,

            notCachedStaleFlagBefore    : datumC.stale  == false,
            notCachedValueBefore        : datumC.value  == undefined,

                notCachedGetResult          : SERVER.c      == 2,
                notCachedStaleFlagAfter     : datumC.stale  == false,
                notCachedValueAfter         : datumC.value  == 2,
        },null,2 )

    },
    want : JSON.stringify ( {
            defaultCachedStaleFlagBefore    : true,
            defaultCachedValueBefore        : true,
            defaultCachedGetResult          : true, // stale flag respected
            defaultCachedStaleFlagAfter     : true, // nothing happened
            defaultCachedValueAfter         : true,

            notCachedStaleFlagBefore    : true,
            notCachedValueBefore        : true,
            notCachedGetResult          : true, // stale flag ignored
            notCachedStaleFlagAfter     : true, // result recomputed anyway 
            notCachedValueAfter         : true,

    },null,2 )

},
{   test : `Algo.trait: hasSinks`,
    code : function () {
        let SERVER = new Graph ('server')
        SERVER.a1 = new Algo (  s => { s.a2 = 2; return true } )
        SERVER.b1 = new Algo (  s => { s.b2 = 2; return true }, 
                                { hasSinks: false } )

        //console.log ( SERVER.a1, SERVER.a2 )
        //console.log ( SERVER.b1, SERVER.b2 )
        //console.log ( SERVER('vertices') )
    
        return JSON.stringify ( 
            [ SERVER.a1, SERVER.a2, SERVER.b1, SERVER.b2 ]
        )
    },
    want : JSON.stringify ( [ true, 2, true, undefined ] )
},

{   test : `Algo.trait: hasSources`,
    code : function () {
        let SERVER = new Graph ('server')

        SERVER.a = 1
        SERVER.b = new Algo (  s => s.a + 2 )
        SERVER.c = new Algo (  s => s.a + 2, 
                                { hasSources: false } )

      //console.warn ( SERVER.b )
      //console.warn ( SERVER.c )
      //console.log ( SERVER('vertices') )
    
        return JSON.stringify ( 
            [ SERVER.b, SERVER.c ]
        )
    },
    want : JSON.stringify ( [ 3, NaN ] )
},

//*/
{   test : `Algo.trait: reactive`,
    code : function () {

// Approach: on set 


    },
    want : undefined
},
//*/
{   warning : `Safe Algo will lock sinks from being updated by other sources;
will lock sources from being deleted;.`,
},
{   warning : `Arrow creation generally doesn't check for old arrows.`,
},
{   warning : `When a Datum is replaced by an Algo, what happens to arrows
initially known to the Datum?.`,
},
{   warning : `When a vertex's value is updated, the vertex's arrows, cache, and
log, are untouched.`,
},

{   warning : `when a pusher is created, should its dependents be made pullers
also? can this be optional?`,
},

{   warning : `when a puller is created, should its dependencies be made pushers
also? can this be optional?`,
},
{   warning : `Caching with arrows (push / pull)`,
},
{   warning : `Review Graph() and Datum() application API`
},
{   warning : `Review exam.js depth - it is hiding traces`
},
{   warning: `Perhaps a lot of props of values in the graph should be inenumerable. However, until we write a utlity function to recursively list all enumerables up the prototype chain, we can develop using enumerable properties except when fundamentally dysfunctional.`
},
{   warning: `Algo is safe by default; Safe extends Algo just for synonymy;
Danger extends Safe; EventListener extends Danger.`
},
{   warning: `MAYBE in the future: Graph is not a class.. rather graph behaviour
is an Algo that you can load into a Datum... this sounds a bit lispy, and I am
not sure if it is feasible.`
},
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
//*/
/* Testing conveniences for the browser:

g = new Graph('server')

//g.d = new Algo ( e => e.a + e.b )

g.e = 1
g.f = 2
g.g = new Algo ( e => e.e + e.f )

g.h = {}
g.h.i = 4
g.h.j = 5
g.h.k = new Algo ( e => e.h.i + e.h.j )

g('vertices')

*/

/* Templates: 

{   test : ``,
    code : function () {
    },
    //want : 'legible'
    //vfun :
},

{   test : ``,
    code : function () {
    },
    expectError : true
},

{   warning : ``,
},
*/
    ] } )
