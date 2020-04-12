import * as Corner from '../corner.js'
import * as CornerView from '../corner-view.js'
import * as Exam from '../lib/submodules/exam.js/exam.js'
//import * as Serl from   '../lib/serl.js'
//import * as SSON from   '../lib/sson/sson.js'

window.CornerView = CornerView

let p = thing => JSON.stringify ( thing, null, 4 )

globalThis.Script   = Corner.Script
globalThis.Datum    = Corner.Datum
globalThis.Graph    = Corner.Graph 

new Exam.Exam ( { 
    config : {
        expand : {
          initialContext : true,
          //tests : {
          //    legible : true,
          //    verifiable : true
          //},
          //unexpectedScript : false
        }
    },
    concerns : [ 
//*
{   test : `Graph class constructor can return a graph store.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        //console.log( STORE )
        //console.log( STORE ( 'graph' ) )
        return {    graphInstance   : STORE ( 'graph' ),
                    literalTree     : STORE ()             }
    },
    want : 'vfun',
    vfun : (r) =>   r.graphInstance instanceof Graph
                    &&
                    r.literalTree.constructor == Object 
},
{   test : `Query graph store for key, where key has not been set.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        return STORE.location 
    },
    want : undefined
},
{   test : `Assign value to key in store; does assignment statement return a
            normal value? Is the assigned value at Graph.value.key?`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.location = 'France'
        //console.log (STORE( 'graph' ).value.location( 'datum' ).value)
        return  JSON.stringify ( [   STORE.location = 'Malaysia' ,
                    STORE( 'graph' ).value.location( 'datum' ).value
                ] )
    },
    want : JSON.stringify ( [ 'Malaysia', 'Malaysia' ] )
},
{   test : `Query graph store for key, where key has been assigned.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.location = 'Malaysia'
        return STORE.location  
    },
    want : 'Malaysia' 
},
{   test : `Assign (undefined) to key in store; does assignment statement return a normal value?`,
    code : function () {
        let STORE = new Graph ( 'store' )
        return ( STORE.testundefined = undefined )     
    },
    want : undefined 
},
{   test : `Try to set a property value, on a store key which is undefined.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        return ( STORE.location.sublocation = 'Puchong' )
            // where STORE.location has not been set
    },
    expectError : true
},
{   test : `Assign subkey to key in store; does assignment statement return a normal value?`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.address = {}
        return ( STORE.address.street = 'Jalan 1' )
    },
    want : 'Jalan 1'
},
{   test : `Query store for a subkey, which has been assigned.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.address = {}
        STORE.address.street = 'Jalan 1' 
        return ( STORE.address.street )
    },
    want : 'Jalan 1'
},
{   test : `Assign and query a sub-sub-key in store`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.address = {}
        STORE.address.unit = {}
        STORE.address.unit.part1 = 'The'
        return ( STORE.address.unit.part1 )
    },
    want : 'The'
},
{   test : `Assign, and query, lambdas and other values, at key, sub-key, and
                sub-sub-key, in the store.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.address = {}
        STORE.address.unit = {}
        STORE.address.unit.part2 = {}
        STORE.address.unit.part2.part2a = {}
            STORE.location = 'Malaysia'
            STORE.testundefined = undefined
            STORE.address.street = 'Jalan 1' 
            STORE.function0 = () => 'function0 has returned'
            STORE.address.function1 = () => 'function1 has returned'
            STORE.address.unit.function2 = () => 'function2 has returned'
            STORE.address.unit.part2.somethingElse = 'Home'
            STORE.address.unit.part2.part2a.deeperKey = '1,2,3 here is a deeper key'
        return JSON.stringify ({
                0: STORE.function0(),
                1: STORE.address.function1(),
                2: STORE.address.unit.function2(),
                3: STORE.address.unit.part2.somethingElse,
                4: STORE.address.unit.part2.part2a.deeperKey 
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
  
{   test : `Tree insertion to, and extraction from, graph store.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.tree = { "address": {
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
            aDatum  : STORE.tree( 'datum' ) instanceof Datum,
            aPOJO   : STORE.tree() 
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
        let STORE = new Graph ( 'store' )
        STORE.deletable = 'hi'
        STORE.tree = {
            a : 1,
            b : {
                c : 2,
                d : { e : 3 } 
            } 
        } 

        return JSON.stringify ( [

            STORE.deletable ,
            delete STORE.deletable ,
            STORE.deletable,

            STORE.tree.b.d = 1,
            JSON.parse( JSON.stringify( STORE.tree() )) , // spread operator makes a shallow copy

            STORE.tree.b.d = [11,22,,44,,,77],
            JSON.parse( JSON.stringify( STORE.tree() )),

            STORE.tree.b.d = {z:1, y:2, x: {m:1, n:2} },
            JSON.parse( JSON.stringify( STORE.tree() )),

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
        let STORE = new Graph ( 'store' )
        STORE.source1 = 'theFIRSTpart;' 
        STORE.source2 = 'theSECONDpart;' 

        //console.log (`Before setting STORE.computed2a`)

        STORE.computed2a       = new Script ( s => s.source1 + s.source2 )
        
        //console.log (`After setting STORE.computed2a`)

        //console.log (STORE.computed2a)

        return JSON.stringify ( {
            computedValue   :   STORE.computed2a,
        } )
    },
    want : JSON.stringify ( {
        computedValue   :   'theFIRSTpart;theSECONDpart;'
    } )
},
{   test : `Computed properties; dependency getter / puller - also check pointers on dependents and dependencies.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.source1 = 'theFIRSTpart;' 
        STORE.source2 = 'theSECONDpart;' 

        STORE.computed2a       = new Script ( s => s.source1 + s.source2 )

        //console.log(`Before getting pointers.`)

        //console.log(STORE( 'datum' ).value.computed2a( 'datum' ).pointers.in.causal[0].ikey
        //)

        let computed2apointers    = [
            STORE( 'datum' ).value.computed2a( 'datum' ).pointers.in.causal[0].ikey,
            STORE( 'datum' ).value.computed2a( 'datum' ).pointers.in.causal[1].ikey 
        ]
          //console.log(`After getting pointers.`)

          //console.log (STORE( 'datum' ).value
          //                            .source1( 'datum' )
          //                            .pointers.out.causal[0].okey
          //)

        return JSON.stringify ( {
            computedValue   :   STORE.computed2a,
            computed2apointers:   computed2apointers,
            source1Pointer    :   STORE( 'datum' ).value
                                    .source1( 'datum' )
                                    .pointers.out.causal[0].okey,
            source2Pointer    :   STORE( 'vertices' )
                                    .source2( 'datum' )
                                    .pointers.out.causal[0].okey,
        } )
    },
    want : JSON.stringify ( {
        computedValue   :   'theFIRSTpart;theSECONDpart;',
        computed2apointers:   [ 'source1', 'source2' ],
        source1Pointer    :   'computed2a',
        source2Pointer    :   'computed2a'
    } )
},
{   test : `Computed properties; dependency getter / puller - system should complain if dependencies are not yet defined.`,
    code : function () {
        let STORE = new Graph ( 'store' )
        //STORE.source1 = 'theFIRSTpart;' 
        STORE.source2 = 'theSECONDpart;' 

        STORE.computed2a       = new Script ( s => s.source1 + s.source2 )
    },
    expectError: true
},
{   test : `Computed properties; dependent setter / pusher : 
- pushed computation should not be written until the the Script is run; 
- the Script is run when the Fun's Datum is read (gotten/get);`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.source1 = 'theFIRSTpart;' 
        STORE.source2 = 'theSECONDpart;' 

        STORE.computed3 = new Script ( s => { 

            // pull
            let computed = s.source1 + s.source2
            
            //console.log (`IN Fun: BEFORE PUSH`) 

            // push
            s.sink4 = `Yo mama, I got two parts : ${computed}`
            
            //console.log (`IN Fun: AFTER PUSH`) 

            return computed
        } ) 
        
        //console.log( STORE( 'vertices' ).sink4( 'unproxy' ).pointers.in )

        return JSON.stringify ( {
            sink4Before     : STORE.sink4,
            computed3       : STORE.computed3,
            sink4After      : STORE.sink4,
        } )
    },
    want : JSON.stringify ( {
        sink4Before         : undefined,
        computed3           : `theFIRSTpart;theSECONDpart;`,
        sink4After          : `Yo mama, I got two parts : theFIRSTpart;theSECONDpart;`,
    } )
},
{   test : `Computed properties; dependent setter / pusher : 
- pushed computation should not be written until the the Script is run; 
- the Script is run when the Fun's Datum is read (gotten/get); 
- also check pointers on dependents and dependencies`, 
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.source1 = 'theFIRSTpart;' 
        STORE.source2 = 'theSECONDpart;' 

        STORE.computed3 = new Script ( s => { 

            // pull
            let computed = s.source1 + s.source2
            
            //console.log (`IN Script: BEFORE PUSH`) 

            // push
            s.sink4 = `Yo mama, I got two parts : ${computed}`
            
            //console.log (`IN Script: AFTER PUSH`) 

            return computed
        } ) 

        return JSON.stringify ( {
            sink4Before     : STORE.sink4,
            computed3       : STORE.computed3,
            sink4After      : STORE.sink4,
            computed3pointers :   [   STORE( 'datum' ).value
                                        .computed3( 'datum' ).pointers.in.causal[0].ikey,
                                    STORE( 'datum' ).value
                                        .computed3( 'datum' ).pointers.in.causal[1].ikey 
            ],
            source1Pointer    :   STORE( 'datum' ).value
                                    .source1( 'datum' )
                                    .pointers.out.causal[0].okey,
            source2Pointer    :   STORE( 'vertices' )
                                    .source2( 'datum' )
                                    .pointers.out.causal[0].okey,
            sink4Pointer      :   STORE( 'vertices' )
                                    .sink4( 'datum' )
                                    .pointers.in.causal[0].ikey 
        } )
    },
    want : JSON.stringify ( {
        sink4Before         : undefined,
        computed3           : `theFIRSTpart;theSECONDpart;`,
        sink4After          : `Yo mama, I got two parts : theFIRSTpart;theSECONDpart;`,
        computed3pointers     : [ 'source1', 'source2' ],
        source1Pointer        : 'computed3',
        source2Pointer        : 'computed3',
        sink4Pointer          : 'computed3'

    } )
},
{   test : `graph() and datum() should eject the same thing`,
    code : function () {

        let g = new Graph( 'store' )
        let h = new Graph( 'store' )

    //console.warn ( 'Prepare DATUM', g.a = {}, g.a.i = 4, g.a.j = 5, g)
    //console.warn ( 'Apply DATUM', g.a() )
    //
    //console.warn ( 'Prepare STORE', h.i = 4, h.j = 5, h)
    //console.warn ( 'Apply STORE', h())

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
{   test : `Sourcing subkeys in Scripts`,
    code : function () {

        let g = new Graph( 'store' )
        g.h = new Script ( e => e.h.i + e.h.j )

        return JSON.stringify( g() ) 
    },
    expectError : true
},
{   test : `Tree insertion should handle Scripts smoothly; Scripts should be handled
smoothly by tree extraction; caching works? Lazy reads?`,
    code : function () {

        let G = new Graph( 'store' )

        G.a = 1
        G.b = 2

        G.m = new Script ( e => e.a + e.b )
        G.n = { o: new Script ( e => e.a + e.b ) }

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
{   test : `Script.trait: getHandler`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.a = 1

        STORE.b = new Script ( s => ( s.a + 1 ) )
        //console.warn (STORE.b)

        STORE.c = new Script ( s => ( s.a + 1 ), { getHandler: false } )
        //console.warn (STORE.c)

        return JSON.stringify ( [ STORE.b, STORE.c ] )
    },
    want : JSON.stringify ( [ 2, undefined ] ) 
},
{   test : `Script.trait: cached - do getters check staleness?`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.a = 1

        STORE.b = new Script ( s => ( s.a + 1 ) )
        STORE( 'vertices' ).b( 'datum' ).stale = false

      //console.warn (STORE( 'vertices' ).b( 'datum' ).stale)
      //console.warn (STORE( 'vertices' ).b( 'datum' ).value)
      //console.warn (STORE( 'vertices' ).b( 'datum' ).lambda)
      //console.warn (STORE( 'vertices' ).b( 'datum' ).traits.cached)
      //console.warn (STORE.b)
      //console.warn (STORE( 'vertices' ).b( 'datum' ).stale)
      //console.warn (STORE( 'vertices' ).b( 'datum' ).value)

        STORE.c = new Script ( s => ( s.a + 1 ), { cached : false } )
        STORE( 'vertices' ).c( 'datum' ).stale = false
      
      //console.warn (STORE( 'vertices' ).c( 'datum' ).stale)
      //console.warn (STORE( 'vertices' ).c( 'datum' ).value)
      //console.warn (STORE( 'vertices' ).c( 'datum' ).lambda)
      //console.warn (STORE( 'vertices' ).c( 'datum' ).traits.cached)
      //console.warn (STORE.c)
      //console.warn (STORE( 'vertices' ).b( 'datum' ).stale)
      //console.warn (STORE( 'vertices' ).c( 'datum' ).value)

        let datumB = STORE( 'vertices' ).b( 'datum' )
        let datumC = STORE( 'vertices' ).c( 'datum' )

        return JSON.stringify ( {
            defaultCachedStaleFlagBefore    : datumB.stale  == false,
            defaultCachedValueBefore        : datumB.value  == undefined,

                defaultCachedGetResult          : STORE.b      == undefined,
                defaultCachedStaleFlagAfter     : datumB.stale  == false,
                defaultCachedValueAfter         : datumB.value  == undefined,

            notCachedStaleFlagBefore    : datumC.stale  == false,
            notCachedValueBefore        : datumC.value  == undefined,

                notCachedGetResult          : STORE.c      == 2,
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
{   test : `Script.trait: cached - do sources invalidate dependent caches via
stale flag?`,
    code : function () {
        let STORE = new Graph ( 'store' )

        STORE.a = 1
        STORE.b = new Script (  s => s.a + 2 )

        let vertices = STORE( 'vertices' )
        let b = vertices.b( 'datum' )


      //console.warn ( b.stale, b.value, b.pointers, b.lambda )
      //console.warn ( STORE.b )
      //console.warn ( b.stale, b.value, b.pointers, b.lambda )
    
        return JSON.stringify ( 
            [ b.stale, b.value, STORE.b, b.stale, b.value ]
        )
    },
    want : JSON.stringify ( [ true, undefined, 3, false, 3 ] )
},
{   test : `Script.trait: hasSinks`,
    code : function () {
        let STORE = new Graph ( 'store' )
        STORE.a1 = new Script (  s => { s.a2 = 2; return true } )
        STORE.b1 = new Script (  s => { s.b2 = 2; return true }, 
                                { hasSinks: false } )

        //console.log ( STORE.a1, STORE.a2 )
        //console.log ( STORE.b1, STORE.b2 )
        //console.log ( STORE( 'vertices' ) )
    
        return JSON.stringify ( 
            [ STORE.a1, STORE.a2, STORE.b1, STORE.b2 ]
        )
    },
    want : JSON.stringify ( [ true, 2, true, undefined ] )
},

{   test : `Script.trait: hasSources`,
    code : function () {
        let STORE = new Graph ( 'store' )

        STORE.a = 1
        STORE.b = new Script (  s => s.a + 2 )

      //console.warn ( STORE.b )
      //console.warn ( STORE.c )
      //console.log ( STORE( 'vertices' ) )
    
        return JSON.stringify ( 
            [ STORE.b, STORE.c ]
        )
    },
    want : JSON.stringify ( [ 3, NaN ] )
},
{   test : `Script.trait: reactive`,
    code : function () {
        let STORE = new Graph ( 'store' )
        let sideEffected

        STORE.a = 1
        STORE.b = new Script ( 
            s => { 
                //console.warn ( `lambda`, sideEffected, s.a )
                return sideEffected = s.a + 2
            }, 
            {   reactive    : true,
                getHandler  : false
            } 
        )

      //console.log (   sideEffected,
      //                
      //                STORE.a = 1, 
      //                sideEffected,
      //                STORE.a = 2, 
      //                sideEffected,
      //            ) 
        return JSON.stringify ( [  
            sideEffected,
            STORE.a = 1, sideEffected,
            STORE.a = 2, sideEffected,
        ] )
    },
    want : JSON.stringify ( [ 'sinkNthKeySniffer_kludge2', 1, 3, 2, 4  ] )
},
{   warning : `(works, but test unwritten - maybe move to own repository) Graph Logger (canon)`,
    code : function () {
        let S  = new Graph ( 'store' )
        let GRAPH   = S ( 'graph' )

        S.a = 1 
        S.b = new Script ( q => { 
            q.c = 3
            return q.a 
        } )  
        //console.log ('getting S.b ', S.b)
        
        S.b = 2

        delete S.b

        //console.log ('getting S.b ', S.b)
        
  //for ( const note of GRAPH.log.canon.book ) {
  //    console.log (
  //      note.timeStamp,
  //      note.type,
  //      note.datum.key, ':', note.datum.value
  //    )
  //}
  //    console.log (   `GRAPH LOG`, 
  //                    p ( GRAPH.log ),
  //                    "\n\n",
  //                    `GRAPH.a LOG`, 
  //                    p ( GRAPH.value.a ('unproxy').datum.log.setsPointerOut),
  //                    "\n\n",
  //                    `GRAPH.b LOG`, 
  //                    p ( GRAPH.value.b ('unproxy').datum.log.setsPointerIn ),
  //                    p ( GRAPH.value.b ('unproxy').datum.pointers ),
  //    )
    },
    want : ''
},
{   warning: `(works, but test unwritten) Deep keys in Sinks and Sources`,
    code : function () {

    let S       = new Graph ( 'store' )
  
    S.abacus    = { pieces: 'several', rods: 0, beads: { red: 1 } }
    S.donkey    = { parts: 'many', legs: { hooves: 0 } }
    S.blanket   = new Script ( q => { 

        q.abacus = 7
        q.abacus.rods = 5
        q.donkey.legs.hooves = 4

        return [    q.abacus.pieces, 
                    q.abacus.beads.red,
                    q.donkey.parts          ]
    } )  

    //console.log ( S.blanket ) 


    },
    //want : 'legible'
},
/*
{   test : `D3 graph visualiser`,
    code : function () {

////////////////////////////////////////////////////////////////////////////////
//  Checklist:
//  - C : ok
//  - R : ok (except Scripts with sinks)
//  - U : FAIL (includes overwritings)
//  - D : FAIL
//
//
////////////////////////////////////////////////////////////////////////////////

    let S           = new Graph ( 'store' )
    let GRAPH       = S ( 'graph' )
    let VERTICES    = S ( 'vertices' )
  
//    CornerView.chart ( S ) 

    S.abacus = { pieces: 'several', beads: { red: 1 } }
    S.donkey = { parts: 'many' }

    S.blanket = new Script ( q => { 

//          q.abacus
//          q.donkey
//          q.changeAVeryLongKeyName = Math.random()
//          q.zack = Math.random()
//          return true 

        return [    q.abacus.pieces, 
                    q.abacus.beads.red,
                    q.donkey.parts 
               ]

    } )  

    //console.log ( S.blanket ) 

  setTimeout ( () => {
//     S.abacus
//      S.abacus = 3.142 
//      S.blanket
//      delete S.changeAVeryLongKeyName
//      S.d = {}
//      S.donkey
  }, 2000 )
  setTimeout ( () => {
//      delete S.abacus
//      S.e = null
//      S.blanket
//      S.abacus
//      S.donkey
  }, 3000 )
  setTimeout ( () => {
//      S.blanket
//      delete S.donkey
//      S.f = 1
//      //console.log ( VERTICES.abacus('datum').value )
//      S.donkey
//      S.abacus             
  }, 4000 )
  setTimeout ( () => {
        //delete S.donkey
  }, 8000 )

    },
    //want : 'legible'
},
{   warning : `Corner: Scripts KeySniffers may save multiple mentions of a
source/sink as multiple pointers. Is this good or bad?.`
},
{   warning : `Corner: Scripts KeySniffers may not handle Sink and Source keys which are deep.`
},
{   warning : ` viewer has no mechanised tests :(.`
},
{   test : 'Pointer logging.',
    code : function () {
    
        let S  = new Graph ( 'store' )
        let GRAPH   = S ( 'graph' )

    }
},
{   warning : `Make datum+pointer writes TRANSACTIONAL.`
},
{   warning : `On creation of a Fun.traits.hasSinks, sink's cache needs to be
invalidated, unless Script runs immediately.`
},
{   warning : `Pointer/vertice creation/deletion generally doesn't check for old pointers.`,
},
{   warning : `When a Datum is replaced by an Fun, what happens to pointers
initially known to the Datum?.`,
},
{   warning : `Review Graph() and Datum() application API`
},
{   warning : `A chimerical issue: 

    Fun.TRAITS
        are meta-data, which in combination with 
        
    DATUM.pointers, 
        should be sufficient for describing all relations between vertices;

    however, at this time, the code which implements graph functionality does
    not fully depend on this meta-data at runtime; 

    instead,  graphHandler.set/n  writes the meta-data, after which
    DATUM.pointers are NOT YET used by any code - as the graph already has this
    information stored in the logic of its various handlers; whereas Fun.TRAITS
    continues to be used by runtime code.

        Particularly, refer to  -   cachedDependentHandler
                                -   reactiveDependentHandler

    We should see if it is possible to completely separate these approaches, or
    if we should simply port all implements to one approach, and throw the other
    away.

    In theory, the first approach to fully implement would be the writing of the
    meta-data. And then, the meta-data could be used in run-time code. And then,
    when appropriate, the meta-data could be used to recompile / optimise new
    code that runs independently from the 'temporary ladder to be discarded upon
    reach its top' which is the graph.`,
},
{   warning: `MAYBE in the future: Graph is not a class.. rather graph behaviour
is an Script that you can load into a Datum... this sounds a bit lispy, and I am
not sure if it is feasible.`
},
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
//*/
{   test : `temp: Chart + Reactivity`,
    code : function () {

        let s = new Graph( 'store' )
        CornerView.chart ( s )

        s.e = 1
        s.f = 2
        s.s = new Script ( e => e.e + e.f )

        s.h = {}
        s.h.i = 4
        s.h.j = 6
        s.h.k = new Script ( e => e.h.i + e.h.j )
        s.n = new Script ( s => s.s + s.h.k)


        s.r = new Script ( s => { 
                return s.dependent = s.n 
            }, 
            {   reactive    : true,
                getHandler  : false
            } 
        ) 

        s.n
        setTimeout ( ()=>s.n, 1000 )

        console.warn ( 
            `r`,                        s('vertices').r('datum'), s.r, "\n",
            `n('datum').log.sets.book`, s('vertices').n('datum').log.sets 
        )

    },
    want : ''
},
//*/




/* Testing conveniences for the browser:

//  Multiple bugs here (s.n)
//  :   getHandler-false is not working
//  :   calling Script doesn't always update SINK
//  :   reactivity is not working!    



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

