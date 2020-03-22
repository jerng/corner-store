import * as Corner from '../corner.js'
import * as Exam from '../lib/submodules/exam.js/exam.js'
//import * as Serl from   '../lib/serl.js'
//import * as SSON from   '../lib/sson/sson.js'


new Exam.Exam ( { 
    config : {
        expand : {
            initialContext : true,
            tests : {
                legible : true,
                verifiable : true
            },
            unexpectedCode : false
        }
    },
    concerns : [ 
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
{   test : `Assign value to key in server; does assignment statement return a normal value?`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        return ( ( SERVER.location = 'Malaysia' ) )    
    },
    want : 'Malaysia' 
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
            console.log(JSON.stringify(SERVER(),null,4))
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
        return JSON.stringify ( SERVER.tree(), null, 2 )
    },
    want : JSON.stringify ( { 
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
    }, null, 2 ),
},

{   test : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.`,
    code : function () {

        let SERVER = new Graph ( 'server' )

{
    console.group ('3.0.    Creating a graph server')
    /*
        console.log ( SERVER )                  //  a proxy around the Graph object
        console.log ( SERVER('graph') )         //  the Graph object
        console.log ( SERVER('graph').vertices )//  empty object 
    */
    console.groupEnd (`3.0.    Creating a graph server`)
 
    console.group (`3.1.    Creating a Vertice  OK `)
 
    console.groupCollapsed ( `3.1.0. no namespaces` )
    

    console.warn ( SERVER.location )
        // undefined key

    console.warn ( ( SERVER.location = 'Malaysia' ) )    
        // '=' evaluates to the assigned value

    console.warn ( SERVER.location )     
        // 'Malaysia' 

    console.warn ( SERVER.testundefined = undefined )     
        // '=' evaluates to the assigned value

    console.warn ( SERVER.testundefined )     
        // undefined

    console.warn ( SERVER.address = {} )
        // evaluates to the final, proxy-handled, assigned value 
        //  DEV:
        //      When the subObject {} is set, it is also given a symbol key,
        //          
        //          [graph.parentKey] = 'address'

    console.groupEnd ( `3.1.0. no namespaces` )
 


    console.groupCollapsed ('3.1.1.    Creating a name-spaced Vertice (depth=1) OK ')

    {   //  Expect error:

        //  console.log ( SERVER.location.sublocation = 'Puchong' )
        //  let a = { b : 'hi' }

        //  a.b.c = 'bye'
            // throws an error in strict mode; 
            // fails silently in non-strict mode, while evaluating to 'bye'
    }
  
    console.group (`trying to set the value of a subObject`)
    console.warn ( 'SERVER.address.street = "Jalan 1" : ' 
        + ( SERVER.address.street = 'Jalan 1') ) 
        // evaluates to the assigned value 
    console.groupEnd (`trying to set the value of a subObject`)
    

    console.group (`trying to get the value of a subObject`)
    console.warn ( `SERVER.address.street : ${SERVER.address.street}` )
    console.groupEnd (`trying to get the value of a subObject`)
 
    console.groupEnd ('3.1.1.    Creating a name-spaced Vertice (depth=1) OK ')

    console.groupCollapsed ('3.1.2.    Creating a name-spaced Vertice (depth>1) OK')

    console.groupCollapsed (`trying to set the value of a subSubObject`)

    console.warn ( `SERVER.address.unit = {} : ${
        SERVER.address.unit = {}}` ) // ` //<- syntax highlighting shim
    // evaluates to the assigned value 

    console.warn ( `SERVER.address.unit.part1 = 'The' : ${
        SERVER.address.unit.part1 = 'The'
    }` )

    console.groupEnd (`trying to set the value of a subSubObject`)

    console.groupCollapsed (`trying to get the value of a subSubObject`)
    console.warn ( `SERVER.address.unit.part1 : ${SERVER.address.unit.part1}` )
    console.groupEnd (`trying to get the value of a subSubObject`)
    console.groupCollapsed (`deeper still?`) 
    
    // each of these below is a discrete test
    
    //
    console.warn ( 
        SERVER.function0 = () => 'function0 has returned'
    )
    console.warn ( SERVER.function0() )

    //
    console.warn ( 
        SERVER.address.function1 = () => 'function1 has returned'
    )
    console.warn ( SERVER.address.function1() )

    //
    console.warn ( 
        SERVER.address.unit.function2 = () => 'function2 has returned'
    )
    console.warn ( SERVER.address.unit.function2() )

    //
    SERVER.address.unit.part2 = {}
    SERVER.address.unit.part2.somethingElse = 'Home'
    SERVER.address.unit.part2.part2a = {}
    SERVER.address.unit.part2.part2a.deeperKey = '1,2,3 here is a deeper key'
    
    //
    console.warn ( SERVER.address.unit.part2.somethingElse )
    
    //
    console.warn ( SERVER.address.unit.part2.undefinedKey )
    
    console.groupEnd (`deeper still?`)
    

    console.groupCollapsed (`Tree-extraction from the graph server`) 
    
    //
    console.warn ( `A proxied datumReturner :`, SERVER.address.unit.part2 )
    
    //
    console.error ( `A tree :`, SERVER.address.unit.part2() )
    
    console.groupEnd (`Tree-extraction from the graph server`) 
    

    console.groupCollapsed (`Assigning from the graph server?`) 

    let someVar = SERVER.address.unit.part2
    
    //
    console.warn ( 
        `These expressions return the proxied Datums`,
        someVar, 
        someVar.part2a 
    )

    //
    console.warn ( 
        `This expression returns a simple value`,
        someVar.part2a.deeperKey 
    )  

    console.groupEnd (`Assigning from the graph server?`) 

    console.groupEnd ('3.1.2.    Creating a name-spaced Vertice (depth>1) OK')

    console.groupCollapsed ('3.1.3.    Tree-insertion into the graph server')

    console.warn ( SERVER.tree = {
        a : 1,
        b : {
            c : 2,
            d : { e : 3 } 
        } 
    } )

    console.warn ( SERVER.tree() ) 

    console.warn ( SERVER() ) 
    
    console.groupEnd ('3.1.3.    Tree-insertion into the graph server')

    console.groupEnd ('3.1.    Creating a Vertice  OK ')
 

    console.groupCollapsed ('3.4.    Vertex deletion')

    SERVER.deletable = 'hi'
    console.warn ( SERVER.deletable )
    console.warn ( delete SERVER.deletable )
    console.warn ( SERVER.deletable )
    

    console.warn ( JSON.stringify ( SERVER.tree(), null, 2 ) )

    SERVER.tree.b.d = 1
    console.warn ( JSON.stringify ( SERVER.tree(), null, 2 ) )

    SERVER.tree.b.d = [11,22,,44,,,77]
    console.warn ( JSON.stringify ( SERVER.tree(), null, 2 ) )

    SERVER.tree.b.d = {z:1, y:2, x: {m:1, n:2} } 
    console.warn ( JSON.stringify ( SERVER.tree(), null, 2 ) )

    console.groupEnd ('3.4.    Vertex deletion')
 

    console.groupCollapsed ('4.1.    Dependency Injection')
        
    console.log ( SERVER.source1 = 'theFIRSTpart;' )
    console.log ( SERVER.source2 = 'theSECONDpart;' )

    // pattern 3
    console.warn ( SERVER.computed2a =
        new Algo ( s => s.source1 + s.source2 )
    )
    
    console.warn ( SERVER.computed2a ) 

    console.groupEnd ('4.1.    Dependency Injection')
 

    
    console.log ( SERVER('graph').vertices )  
}

console.groupCollapsed('3.2.    Reading a Vertice   OK')
console.groupEnd('3.2.    Reading a Vertice   OK')

console.warn('3.3.    Updating a Vertice  x')
console.warn(`3.3.    (Does not check for 'configurable' or 'writable' - will only complain when you try to extract the tree with SERVER.key() )`)
console.warn('3.4.    Deleting a Vertice  x')



console.groupCollapsed('4.1.    Creating an Arrow   OK')
console.groupEnd('4.1.    Creating an Arrow   OK')

console.warn('4.2.    Reading an Arrow    x')
console.warn('4.3.    Updating an Arrow   x')
console.warn('4.4.    Deleting an Arrow   x')


        return  'placeholder'

    }, // code
    want : 'legible'
},

/* Templates: 

{   test : ``,
    code : function () {
    },
    want : 'legible'
    vfun :
},

{   test : ``,
    expectError : true,
    code : function () {
    }
},

{   warning : ``,
},
*/
    ] } )

