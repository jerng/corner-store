import * as Serl from   '../lib/serl.js'
import * as SSON from   '../lib/sson/sson.js'
import * as Exam from '../lib/classes/exam.js'


// data type for use in Datum
class ArrowOut {

    constructor ( _okey ) {
        
        this.okey       = _okey
        this.reads      = [    
            // e.g. 1583344147570.9219
        ]
        this.updates    = [
            // e.g. [   1583344147570.932,
            //          "the relevant okey value"
            //      ]
        ]
        this.deletes    = [
            // e.g. [   1583344147570.932,
            //          "the relevant okey value"
            //      ]
        ]

        return this
    }

}

// data type for use in Datum
class ArrowIn {

    constructor ( _ikey ) {
        
        this.ikey       = _ikey
        this.reads      = [    
            // e.g. 1583344147570.9219
        ]
        this.updates    = [
            // e.g. [   1583344147570.932,
            //          "the relevant ikey value"
            //      ]
        ]
        this.deletes    = [
            // e.g. [   1583344147570.932,
            //          "the relevant ikey value"
            //      ]
        ]

        return this
    }

}

// data type for use in Datum
class Algo {

    constructor ( ... args ) {
        
        if ( args.length !== 1 ) {
            throw Error (`Algo.constructor : expected one and only one argument, received (${args.length}) arguments`) 
        }
        if ( typeof args[0] !== 'function' ) {
            throw Error (`Algo.constructor : typeof (argument provided) was not 'function'`)
        }
        /*if ( ! ( 'prototype' in args[0] ) ) {
            throw Error (`Algo.constructor : you appear to have passed in an
            arrow function expression; AFE bodies do not have internal bindings
            for the (this) keyword, instead inheriting (this) from their surrounding
            scope. Therefore, Algo.constructor cannot use Reflect.apply ( AFE,
            this = (new Proxy) ) to sniff the props called on (this) in the AFE's
            function body. Please use a non-arrow function expression instead.`)
        }*/

        // this.verticeKeys = []
        // It is possible to extract this data here, but currently it has been
        // delegated to Graph.serverHandler.set

        let _lambda = this.lambda = args[0]

        return this

    }

}

class Datum {
    // Do not declare fields here! (non-standard feature)

    constructor ( ...args ) {
  
        // initialisers
        this.key
        this.value
        this.algo

        this.arrows     = {
            in      : { 
                // type: [ ArrowIn ]
            },
            out     : {
                // type: [ ArrowOut ]
            }
        }

        this.log        = {
            reads   : [],
            updates : [],
            deletes : []
        }

        this.cache      = {
            stale   : false,
            hits    : [],
            misses  : []
        }

        switch ( args.length )
        {
            case 1 :
                switch ( typeof args[0] ) 
                {
                    case 'string':
                        this.key = args[0]
                        return this

                    case 'object':
                        this.key = Object.keys( args[0] )[0]
                        this.value = args[0][this.key]
                        return this

                    default:
                        throw Error (`Datum::constructor/1 called on n, where
                        (typeof n) is not 'string' or 'object';  branch undefined`)
                }
            default:
                throw Error (`Datum::constructor/n called, branch for this arity is undefined.`)
        }
    }
}

window.Graph = class Graph {
    // Do not declare fields here! (non-standard feature)

    // A graph server, actually.

    updateVertex ( ... args ) {
        //  TODO? : aliases
        //  this.c = this.createVertice 

        let datum
        let datumReturner = () => datum

        switch ( args.length ) 
        {
            case 1:

                datum = new Datum ( args[0] )
                this.vertices [ datum.key ] 
                    = new Proxy ( datumReturner, this.datumHandler )

                // redundant check?
                if ( this.vertices [ datum.key ] !== args[0] ) {
                    throw Error (`Graph::updateVertex/1 called, update failed.`)
                }
                break

            case 2:

                datum = new Datum ( { [ args[0] ] : args[1] } )

                this.vertices [ datum.key ] 
                    = new Proxy ( datumReturner, this.datumHandler )

console.log( `graph.updateVertex :`, datumReturner, this.vertices [ datum.key ] )

                // redundant check?
                return  ( this.vertices [ datum.key ]().value == args[1] ) 
                        ? true
                        : false

            default:
                throw Error (`Graph::updateVertex/n was called, where n's branch remained undefined `)
        }
    }

    // TODO consider, should this be a static method? Performance? Safety? 
    getServerHandler () {
        
        let graph = this

        return {

            // serverHandler
            apply : function( targGraphReturner, thisArg, args ) { 
           
                return targGraphReturner() // the Graph instance
            
            },

            // serverHandler
            get : function( targGraphReturner, prop, rcvr ) {

console.log (`serverHandler.get : graph.vertices['${prop}'].`)

                if ( ! ( prop in graph.vertices ) )
                { 
console.log (`serverHandler.get could not find the key (${prop}) in graph.vertices`)

                    return undefined 
                } else 

                // Wherein. if we find that the user has previously set an
                // object as the value, we try to intercept the call to that
                // object's properties...
                
console.log ( `serverHandler.get got graph.vertices[ '${prop}' ]() : `, graph.vertices [ prop ]() )

                if ( graph.vertices[ prop ].algo )
                {
                  return graph.vertices[ prop ].algo ( graph.server )

                } else

                {   return graph.vertices[ prop ].value }
            },

            // serverHandler
            set : function( targGraphReturner, prop, val, rcvr ) {

console.log ( `serverHandler.set : Try to set graph.vertices['${prop}'] to (${val}).` ) 

                // Wherein, if we find the user trying to set an object as the
                // value, we want to intercept future calls to that object's
                // properties...
                if ( typeof val == 'object' ) {

console.warn (`Naive object check`)

                    //let valReturner = () => val
                        // Because we want to Proxy this, and have an (apply)
                        // handler: the proxied value must be a function.

console.log ( `serverHandler.set : set
graph.vertices [${prop}] ['value' which is a Proxy(()=>value) ] ['graph.parentKey' which is a Symbol] = '${prop}'` ) 

                    // update sub-vertices
                  //for ( const loopProp in val ) {

                  //    if ( !  this.set  ( targGraphReturner, 
                  //                        prop + '.' + loopProp,
                  //                        val[loopProp],
                  //                        rcvr                    )    
                  //    )       // target and receiver could be left 'null'?
                  //    { return false }
                  //}

                    let success

                    // update vertex
                    if ( ! (    success = graph.updateVertex   (   prop, val ) ) )
                    { return false }

                    // IMPORTANT - subObject mark created
                    //valReturner[ graph.parentKey ] = prop

/*
{
    // Detect dependencies and plant arrows.
    if ( val instanceof Algo ) {
        
        let keySniffer = new Proxy ( {}, {
            
            get : ( ksTarg, ksProp, ksRcvr ) => {
               
                // WARNING: does not require dependency keys to be in the graph
                // before dependents are set FIXME
                //
                //  Configure dependencies to track dependent:
                if ( ! ( 'causal' in graph.vertices[ ksProp ].arrows.out ) ) {

                    graph.vertices[ ksProp ].arrows.out.causal = []
                }
                graph.vertices[ ksProp ].arrows.out.causal.push ( { okey: prop } )

                //  Configure dependent to track dependencies:
                if ( ! ( 'causal' in graph.vertices[ prop ].arrows.in ) ) {

                    graph.vertices[ prop ].arrows.in.causal = []
                }
                graph.vertices[ prop ].arrows.in.causal.push ( { ikey: ksProp } )
            }
        } )
        //Reflect.apply ( val.lambda, keySniffer, [] )
        val.lambda ( keySniffer )

        // tag for serverHandler.get performance
        
        graph.vertices[ prop ].algo = val.lambda

    }
}
*/                    return success

                } // serverHandler.set, if ( typeof val == 'object' )
                
                
                else { return graph.updateVertex ( prop, val ) }

            
            } // serverHandler.set
        
        } // serverHandler
    }

    // TODO consider, should this be a static method? Performance? Safety?
    getDatumHandler () {

        let graph = this

        return {
            // datumHandler
            apply : function( targDatumReturner, thisArg, args ) { 

console.log (`graph.datumHandler.apply : `, targDatumReturner, thisArg, args )
                return targDatumReturner()
            },
            get : function( targDatumReturner, prop, rcvr ) {

console.log (`graph.datumHandler.get : `, prop, rcvr )
            },
            set : function( targDatumReturner, prop, val, rcvr) {

console.log (`graph.datumHandler.set : `, prop, val, rcvr)
            }

        }
    }

    // TODO consider, should this be a static method? Performance? Safety?
    getValueHandler () {

        let graph = this

        return {

            // valueHandler
            apply : function( targValueReturner, thisArg, args ) { 

    //  When, a SERVER.key() is called...
    //  ... it refers to the underlying Graph object,
    //  and looks at... 
    //
    //      graph.vertices['key'] => a Datum    
    //      
    //  ... where...
    //
    //      datum.value
    //
    //  ... may be  (1.) a non-object, or
    //              (2.) a Proxy
    //
    //  ... where the proxy's target is a valReturner of
    //  the form...
    //
    //      () => val
    //
    //  ... where...
    //
    //      valReturner[graph.parentKey] => 'key'
    //
    //  ... a Symbol key may or may not be set which,
    //  WHEN SET, marks the val as an object which has
    //  properties tracked in the graph via compound
    //  keys of the form...
    //
    //      graph.vertices[ 'key' + '.' + subKey ]
    //
    //////////////////////////////////////////////////

                            //////////////////////////////////////////////////
                            //
                            //  ** BASED ON THE CONTEXT GIVEN ABOVE **
                            //
                            //  This code runs upon calls of the form:
                            //
                            //      SERVER.key.subKey.subSubKey()
                            //
                            //  ... where ...
                            //
                            //  thisArg is the proxied parent valReturner, where...
                            //
                            //              valReturner[graph.parentKey] => 
                            //                  'key.subKey'
                            //  ;
                            //  targ    is the child valReturner, where ...
                            //
                            //              valReturner[graph.parentKey] =>
                            //                  'key.subKey.subSubKey'
                            //  ;
                            //
                            //  targ()  will return the value of the "original
                            //          object" set at...
                            //
                            //              graph.vertices['key.subKey']
                            //  ;
                            //
                            //  ... and here what we want the code to do, is
                            //  to take the "original object", update it based
                            //  on those of its properties were tracked by the
                            //  graph, and then to return the updated object to
                            //  the user.
                            
console.log ( `valueHandler.apply : ` )                          
console.log ( targValueReturner[graph.parentKey] )

                let initial         =   targValueReturner()                         
                let subKeys         =   
                    Object
                        .keys ( graph.vertices )
                        .reduce (
    (acc, cur, ind, arr) => 
    {
        if (cur.startsWith ( targValueReturner[ graph.parentKey ] + '.') ) 
        {   
            let key = cur.slice (
                targValueReturner[graph.parentKey].length + 1
            )
            if ( ! key.includes ( '.') )
            {
                acc[key] =  (   ( typeof graph.server[cur] == 'function' )
                                &&
                                ( graph.parentKey in graph.server[cur] )
                            )   
                            ? graph.server[cur]() 
                            : graph.server[cur]
            }
        }
        return acc
        
    }
    
                , initial ) // reduce()

                return initial
            },

            // valueHandler
            get : function( targValueReturner, prop, rcvr ) {

//console.log ( `valueHandler.get's target :`)
//console.log ( targ )
console.group ( `valueHandler.get's receiver :`)
console.log ( rcvr )
console.groupEnd ( `valueHandler.get's receiver :`)

console.log ( `valueHandler.get the prop:  ${prop}` )

                // IMPORTANT - subObject mark read
                if ( graph.parentKey in targValueReturner ) {
//console.log ( `valueHandler.get found a parentKey in the (targ) argument` )
                    
                    let compoundKey =
                            targValueReturner[ graph.parentKey ]
                            + '.'
                            + prop

console.group (`valueHandler.get: will get a compoundKeyed vertex (${compoundKey}) :`)
console.log ( graph.vertices[ compoundKey ] )
console.groupEnd (`valueHandler.get: will get a compoundKeyed vertex (${compoundKey}) :`)

                    if ( ! ( compoundKey in graph.vertices ) ) { 

console.log (`valueHandler.get could not find the key (${compoundKey}) in graph.vertices`)
                        return undefined 
                    }

console.warn ( graph.vertices[ compoundKey ].value )

                    { return graph.vertices[ compoundKey ].value }
                }

                else { return targValueReturner[ prop ] }
            },

            // valueHandler
            set : function( targValueReturner, prop, val, rcvr) {
console.log (`valueHandler.set the prop : (${prop})`)

                // IMPORTANT - subObject mark read
                if ( graph.parentKey in targValueReturner ) {
                    
console.log (`valueHandler.set:  found a parentKey in (${targValueReturner})`)
                    let compoundKey = 
                            targValueReturner[ graph.parentKey ]
                            + '.'
                            + prop
                    
                    let success

                    // this code seems redundant, with
                    // serverHandler's code, but we'll just
                    // roll with it for now...
                    if ( typeof val == 'object' ) {

                    let valReturner = () => val
                        // Because we want to Proxy this, and have an (apply)
                        // handler: the proxied value must be a function.

                    // IMPORTANT - subObject mark created
                    valReturner[ graph.parentKey ] = compoundKey 

                        

console.log ( `valueHandler.set: the handler : ` )
console.log ( graph.valueHandler )

                        success = graph.updateVertex ( 
                            compoundKey, 
                            new Proxy ( valReturner, graph.valueHandler )
                        )
console.log (`valueHandler.set: set a compoundKey (${compoundKey}) with a proxied value`)
                    }
                    else { 
                        success 
                            = graph.updateVertex ( compoundKey, val )

console.log (`valueHandler.set: set a compoundKey (${compoundKey}) with a non-object`)
                    } 
                   
                    return success

                } 
                
                else {
                
                    targValueReturner[ prop ] = val

                    // redundant check?
                    return  targValueReturner[ prop ] == val
                }
            
            } // valueHandler.set

        } // valueHandler
    }

    //  Graph()
    constructor ( node ) {

        // initialisers

            //  'graphReturner' and 'graphServer' have been renamed more
            //  succinctly to 'returner' and 'server' respectively. 
            //
            //  Reasons to reverse this decision:
            //
            //  It may aid in the reading of code,
            //  and to help the reader learn the semantics of this framework.
            //  Perhaps in the future, the shorter names could be used. For now,
            //  aliases will be introduced.

        this.vertices       = {} 

        this.parentKey      = Symbol()

        this.returner       = () => this

        this.serverHandler  = this.getServerHandler()

        this.server         = new Proxy (   this.returner, this.serverHandler )

        //this.valueHandler   = this.getValueHandler()

        this.datumHandler   = this.getDatumHandler()

        if ( ! ( node instanceof Serl.Node ) ) {
            
            // throw Error ( `Graph::constructor() called, first argument was not an instance of Serl.Node.` )
            
            node = new Serl.Node ( 'node created by Graph::constructor()' )
        }

        return  {   serlNode    : node, 
                    graph       : this,
                    server      : this.server  }

    } // Graph.constructor

}

new Exam.Exam ( { 
    config : {
        expand : {
            initialContext : true,
            tests : {
                legibility : true,
            },
            unexpectedCode : false
        }
    },
    concerns : [ 
/*    
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
{   warning: `Perhaps a lot of props of values in the graph should be inenumerable. However, until we write a utlity function to recursively list all enumerables up the prototype chain, we can develop using enumerable properties except when fundamentally dysfunctional.`
},
*/
{   test : `Build a reactive datastore, where each datum is represented by a Proc instance.`,
    code : function () {

        let {   serlNode    : node, 
                graph       : g,
                server      : SERVER } = new Graph 

console.groupCollapsed ('3.0.    Creating a graph server')

    console.log ( SERVER )      //  a proxy around the Graph object
    console.log ( SERVER() )    //  the Graph object
    console.log ( g )           //  the Graph object
    console.log ( g.vertices )  //  empty object 

console.groupEnd (`3.0.    Creating a graph server`)

{   console.group (`3.1.    Creating a Vertice  OK `)

    {   console.groupCollapsed ( `3.1.0. no namespaces` )
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
console.error ( `WIP HERE` ) 
            //  DEV:
            //      When the subObject {} is set, it is also given a symbol key,
            //          
            //          [graph.parentKey] = 'address'

        console.groupEnd ( `3.1.0. no namespaces` )
    }

    {   console.group ('3.1.1.    Creating a name-spaced Vertice (depth=1) OK ')

        {   //  Expect error:

        //  console.log ( SERVER.location.sublocation = 'Puchong' )
        //  let a = { b : 'hi' }

        //  a.b.c = 'bye'
                // throws an error in strict mode; 
                // fails silently in non-strict mode, while evaluating to 'bye'
        }

        {   console.group (`trying to set the value of a subObject`)
            console.warn ( `SERVER.address.street = 'Jalan 1' : ${SERVER.address.street = 'Jalan 1'}` ) // ` <- shim: syntax highlighting
                // evaluates to the assigned value 
            console.groupEnd (`trying to set the value of a subObject`)
        }

        {   console.group (`trying to get the value of a subObject`)
            console.warn ( `SERVER.address.street : ${SERVER.address.street}` )
            console.groupEnd (`trying to get the value of a subObject`)
        }
        console.groupEnd ('3.1.1.    Creating a name-spaced Vertice (depth=1) OK ')
    }
        
/*       
    {   console.group ('3.1.2.    Creating a name-spaced Vertice (depth>1) OK')

        {   console.groupCollapsed (`trying to set the value of a subSubObject`)

            console.warn ( `SERVER.address.unit = {} : ${SERVER.address.unit = {}}` ) // ` <- syntax highlighting shim
                // evaluates to the assigned value 

            console.warn ( `SERVER.address.unit.part1 = 'The' : ${
                SERVER.address.unit.part1 = 'The'
            }` )

            console.groupEnd (`trying to set the value of a subSubObject`)
        }

        {   console.groupCollapsed (`trying to get the value of a subSubObject`)
            console.warn ( `SERVER.address.unit.part1 : ${SERVER.address.unit.part1}` )
            console.groupEnd (`trying to get the value of a subSubObject`)
        }

        {   console.groupCollapsed (`deeper still?`) 
        
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
        }

        {   console.groupCollapsed (`Tree-extraction from the graph server`) 
            
            //
            console.warn ( SERVER.address.unit.part2 )
            
            //
            console.warn ( SERVER.address.unit.part2() )

            console.groupEnd (`Tree-extraction from the graph server`) 
        }

        {   console.groupCollapsed (`Assigning from the graph server?`) 

            //
            let someVar = SERVER.address.unit.part2
            
            //
            console.warn ( 
                `These expressions return the proxied values`,
                someVar, 
                someVar.part2a 
            )

            //
            console.warn ( 
                `These expressions return the extracted trees`, 
                someVar(),
                someVar.part2a()
            )
            
            //
            console.warn ( 
                `This expression returns a simple value`,
                someVar.part2a.deeperKey 
            )  

            console.groupEnd (`Assigning from the graph server?`) 
        }
        console.groupEnd ('3.1.2.    Creating a name-spaced Vertice (depth>1) OK')
    }

    {   console.groupCollapsed ('3.1.3.    Tree-insertion into the graph server')

        console.warn ( SERVER.tree = {
            a : 1,
            b : {
                c : 2,
                d : { e : 3 } 
            } 
        } )

        console.warn ( SERVER.tree() ) 
        
        console.groupEnd ('3.1.3.    Tree-insertion into the graph server')
    }
*/
    console.groupEnd ('3.1.    Creating a Vertice  OK ')
}

/*
{   console.group ('4.1.    Dependency Injection')
        
    console.log ( SERVER.source1 = 'theFIRSTpart;' )
    console.log ( SERVER.source2 = 'theSECONDpart;' )


    // pattern 3
    console.warn ( SERVER.plain = {} ) 
    console.warn ( SERVER.plain ) 

    console.warn ( SERVER.computed2a =
        new Algo ( s => s.source1 + s.source2 )
    )
    
    console.warn ( SERVER.computed2a ) 

    console.groupEnd ('4.1.    Dependency Injection')
}
*/

{   
    console.log ( SERVER().vertices )  
}
/*
console.groupCollapsed('3.2.    Reading a Vertice   OK')
console.groupEnd('3.2.    Reading a Vertice   OK')

console.warn('3.3.    Updating a Vertice  x')
console.warn(`3.3.    (Does not check for 'configurable' or 'writable' - will only complain when you try to extract the tree with SERVER.key() )`)
console.warn('3.4.    Deleting a Vertice  x')

console.error(`4.1. the Graph class now manipulates Datum instances to its own ends; most of that code is in the graph.serverHandler; however, aside from the application-specific serverHandler, the Graph class lacks application agnostic code for CRUD; much of what serverHandler does is facilitate a UIX for the developer using the graph.server... to make namespacing of data easier via nested objects; however none of that is needed for graph data analysis and traversal in general... so how separate should these concerns be? Consider this next.`)


console.groupCollapsed('4.1.    Creating an Arrow   OK')
console.groupEnd('4.1.    Creating an Arrow   OK')

console.warn('4.2.    Reading an Arrow    x')
console.warn('4.3.    Updating an Arrow   x')
console.warn('4.4.    Deleting an Arrow   x')
*/


        return  'placeholder'

    }, // code
    want : 'legible'
},


/* Templates: 

{   test : ``,
    code : function () {
    }
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

