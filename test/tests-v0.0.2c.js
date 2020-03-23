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
{   warning : `make Graph an extension of Datum?`,
},
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
{   warning: `Perhaps a lot of props of values in the graph should be inenumerable. However, until we write a utlity function to recursively list all enumerables up the prototype chain, we can develop using enumerable properties except when fundamentally dysfunctional.`
},
{   test : `Graph class constructor can return a graph server.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
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
        return  JSON.stringify ( [   SERVER.location = 'Malaysia' ,
                    SERVER('vertices').location('datum').value
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
            aDatum  : SERVER.tree instanceof Datum,
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

{   test : `Computed properties; dependency getter / puller`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed2a = new Algo ( s => s.source1 + s.source2 )
        
        return SERVER.computed2a 

    },
    want : 'theFIRSTpart;theSECONDpart;'
},

{   test : `Computed properties; dependent setter / pusher`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computer3 = new Algo ( s => { 
            let computed = s.source1 + s.source2
            s.sink4 = `Yo mama, I got two parts : ${computed}`
        } ) 
        SERVER.sink4
        
        return SERVER.sink4
    },
    want :`Yo mama, I got two parts : theFIRSTpart;theSECONDpart;`
},

{   warning : `when arrows are created, we should check for existing arrows
first to avoid duplicates (or change data structure to key =>) `,
},

{   warning : `when a pusher is created, should its dependents be made pullers
also? can this be optional?`,
},

{   warning : `when a puller is created, should its dependencies be made pushers
also? can this be optional?`,
},

{   warning : `standardise all handlers to either Function Expressions or Arrow
Function Expressions`,
},

{   warning : `setVertex, Algo: does not require dependency/dependent keys to be in the
                graph before dependents are set FIXME`,
},

{   warning : `Caching with arrows (push / pull)`,
},
/*
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

