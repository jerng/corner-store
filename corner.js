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

/**
 *  Arities:
 *
 *  1   :   Argument is typechecked.
 *      
 *      String ?    datum.key <= argument,
 *
 *      Object ?    datum.key   <= object's first key,
 *                  datum.value <= object's first value,
 *      
 *                  ... to be implement: object's other key/values as inputs... 
 *      
 *      Array ?     ... to be implemented as lists of the above...       
 */

class Datum {
    // Do not declare fields here! (non-standard feature)

    constructor ( ...args ) {
  
        // initialisers
        this.key
        this.value
        //this.algo

        this.arrows     = {
            in      : { 
                // variousTypeKeys: [ ArrowIn ]
            },
            out     : {
                // variousTypeKeys: [ ArrowOut ]
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
                throw Error (`datum.constructor/n called, branch for this arity is undefined.`)
        }
    }
}

class DatumReturner extends Function {
    constructor ( datum ) {
        super()
        return new Proxy ( this, {
                apply: function ( targ, thisArg, args ) {
                    return datum
                }
            } )
    } 
}

class Graph {
    // Do not declare fields here! (non-standard feature)

    // A graph server, actually.

    //  Graph()
    constructor ( ... args ) {


        // initialisers

        this.vertices       = {} 

        this.returner       = () => this

        this.datumHandler   = this.getDatumHandler()

        this.serverHandler  = this.getServerHandler()

        this.server         = new Proxy ( this.returner, this.serverHandler )

        /*
        if ( ! ( node instanceof Serl.Node ) ) {
            
            // throw Error ( `Graph::constructor() called, first argument was not an instance of Serl.Node.` )
            
            node = new Serl.Node ( 'node created by Graph::constructor()' )
        }
        */

        switch ( args.length ) {
            case 0:
                return  {   //serlNode    : node, 
                            graph       : this,
                            server      : this.server  }

            case 1:
                switch ( args[0] ) {
                    case 'server':
                        return this.server

                    case 'graph':
                        return this
                        
                    default:
                        throw Error (`Graph.constructor/1 called, the argument
                        was not understood.`)
                }
                break

            default:
                throw Error (`Graph.constructor/n called, where no branch was
                defined for arity-n.`)
        }

    } // Graph.constructor

    deleteVertex ( key ) {

        if ( ! ( key in this.vertices ) ) { return true }

        // delete subkeys
        if ( ( typeof this.vertices[ key ]('datum').value == 'object' ) ) 
        {
            for ( const loopKey in this.vertices ) {

                if ( loopKey.startsWith ( key + '.' ) ) {
                    
                    if ( ! this.deleteVertex ( loopKey ) ) { return false }
                }
            }
        }
        
        delete this.vertices[ key ]

        return ! ( key in this.vertices )
    }

    getVertex ( key ) {
        if ( ! ( key in this.vertices ) )
        { 
            //console.log(this)
            //console.log (`graph.getVertex/1 could not find the key (${key}) in
            //graph.vertices`)

            return undefined 
        }

        let value = this.vertices[ key ]()
            //console.log ( `graph.getVertex/1 will get graph.vertices[ '${key
            //}' ]() : `, this.vertices [ key ]() )

        if ( value instanceof Algo ) { 
            //console.log (`graph.getVertex/1 will now return datum.value.lambda ( graph.server )`)
            return value.lambda ( this.server ) 
        } 

        else

        if ( typeof value == 'object' )
        {
            // Wherein. if we find that the user has previously set an
            // object as the value, we try to intercept the call to that
            // object's keyerties...
            //console.log (`graph.getVertex/1 : found that datum.value is
            //an object, so will return graph.vertices ['${key}'] `)

            return this.vertices[ key ] 
        } 

        else
        { return value } 
    }

    setVertex ( ... args ) {
        //  TODO? : aliases
        //  this.c = this.createVertice 

        let datum
            // Because we want to Proxy this, and have an (apply)
            // handler: the proxied value must be a function, which will wrap
            // around the datum with a DatumReturner.

        switch ( args.length ) 
        {
            case 0:
                throw Error (`graph.setVertex/0 called; unsupported arity.`)

            case 1:

                console.warn (`graph.setVertex/1 : rewrite & test for this branch`)
                
                let key = args[0]  

                datum   = new Datum ( key )

                this.vertices [ datum.key ] 
                    = new Proxy ( new DatumReturner ( datum ), this.datumHandler )

                break
        }
        // HEREON: args.length > 1

        let key     = args[0]
        let value   = args[1]

        // updates are destructive
        if ( ! this.deleteVertex ( key ) ) { return false }

        datum = new Datum ( { [key] : value } )

        // update sub-vertices
        if ( typeof value == 'object' ) {
         
            for ( const subKey in value ) {

                let compoundKey = key + '.' + subKey
                if ( !  this.setVertex ( compoundKey, value[ subKey ] ) )       
                { return false }
            }
        }

        if ( value instanceof Algo ) {

            let keySniffer = new Proxy ( {}, {
                
                get : ( ksTarg, ksProp, ksRcvr ) => {
                  
                    //console.log (`serverHandler.set, val is an Algo, :`,
                    //this.vertices[ ksProp ]('Datum') )

                    //  Configure dependent to track dependencies:
                    if ( ! ( 'causal' in datum.arrows.in ) ) {

                        datum.arrows.in.causal = []
                    }
                    datum.arrows.in.causal.push ( new ArrowIn ( ksProp) )

                    // WARNING: does not require dependency keys to be in the graph
                    // before dependents are set FIXME
                    //
                    //  Configure dependencies to track dependent:

                    let dependencyDatum = this.vertices[ ksProp ]('datum')

                        if ( ! ( 'causal' in dependencyDatum.arrows.out ) ) {
                            
                            dependencyDatum.arrows.out.causal = []
                        }
                        dependencyDatum
                            .arrows.out.causal.push ( new ArrowOut ( key) )
                }
            } )

            // Detect dependencies and plant arrows.
            value.lambda ( keySniffer )

        } // (value instanceof Algo)

        this.vertices [ datum.key ] 
            = new Proxy ( new DatumReturner ( datum ), this.datumHandler )

        //console.log( `graph.setVertex/[n>1] :`, datum.key, this.vertices [
        //datum.key ]() )

        // redundant? check
        return  ( this.vertices [ datum.key ]() == args[1] ) 
                ? true
                : false
    }

    // TODO consider, should this be a static method? Performance? Safety?
    getDatumHandler () {

        let graph = this

        let datumHandler = {

            // datumHandler
            apply : function( targDatumReturner, thisArg, args ) { 

                switch ( args.length ) {
                    case 0:
                        //console.log (`graph.datumHandler.apply/0 : (DATUMKEY, DATUMVALUE,
                        //    thisArg, args) `, targDatumReturner().key,
                        //    targDatumReturner().value, thisArg, args )

                        let datum = targDatumReturner()

                        return  typeof datum.value == 'object'
                                    ? graph.recoverEnumerableProperties ( datum )
                                    : datum.value
                    
                    case 1:
                        //console.log (`graph.datumHandler.apply/1 : `)
                        switch (args[0])
                        {
                            case 'datum':
                                return targDatumReturner()

                            default:
                                throw Error (`graph.datumHandler.apply/1 : the argument was
                                not understood`)
                        }

                    default:
                        throw Error (`graph.datumHandler.apply/n, where arity-n has no defined branch`)
                }

            },

            // datumHandler
            deleteProperty : function ( targDatumReturner, prop ) {
                return graph.deleteVertex ( prop )    
            },

            // datumHandler
            get : function( targDatumReturner, prop, rcvr ) {

                //console.log (`graph.datumHandler.get : (DATUMKEY, PROP, rcvr)`,
                //    targDatumReturner().key, prop, rcvr, targDatumReturner(),
                //    graph.vertices[ targDatumReturner().key + '.' + prop ] )

                return graph.getVertex ( targDatumReturner().key + '.' + prop )
            },

            // datumHandler
            set : function( targDatumReturner, prop, val, rcvr) {

                //console.log (`graph.datumHandler.set : (DATUMKEY, PROP, val,
                //    rcvr)`, targDatumReturner().key, prop, val, rcvr )
                
                //      This is upstream (via Proxy ( () => graph )'s set
                //      handler ) graph.setVertex/2 already does a
                //      redundant check that the graph.vertices['prop'] was
                //      set correctly.
                return  graph.setVertex ( 
                            targDatumReturner().key + '.' + prop, 
                            val                                     )
            }
        }
        return datumHandler
    }

    // TODO consider, should this be a static method? Performance? Safety? 
    getServerHandler () {
        
        let graph = this

        let serverHandler = {

            // serverHandler
            apply : function( targGraphReturner, thisArg, args ) { 
           
                switch ( args.length ) {
                    case 0:
                        return graph.recoverEnumerableProperties ( {} )
                    
                    case 1:
                        switch ( args[0] ) {

                            /*
                            case 'node' :
                                // Serl Node, TODO
                                break
                            */

                            case 'graph' :
                                return graph // same as targGraphReturner()
                            
                            case 'server' :
                                return graph.server 
                            
                            default:
                                throw Error (`graph.serverHandler/1 called;
                                the argument was not understood`)
                        }    
                    
                    default:
                        throw Error (`graph.serverHandler/n called, where no
                        branch is defined for arity-n`)
                }
            
            },

            // serverHandler
            deleteProperty : function ( targGraphReturner, prop ) {
                return graph.deleteVertex ( prop )    
            },

            // serverHandler
            get : function( targGraphReturner, prop, rcvr ) {

                //console.log (`serverHandler.get : graph.vertices['${prop}'].`)

                return graph.getVertex ( prop )
            },

            // serverHandler
            set : function( targGraphReturner, prop, val, rcvr ) {

                //console.log ( `serverHandler.set : Try to set graph.vertices['${prop}'] to (${val}).` ) 

                return graph.setVertex ( prop, val )
            
            } // serverHandler.set
        
        } // serverHandler

        return serverHandler
    }

    //  Operates on an instance of Datum, whose value has typeof 'object'
    // 
    //  Generally used to unflatten vertices from the graph index, before
    //  returning the unflatted object to the user.
    //
    recoverEnumerableProperties ( object ) {

        if ( object instanceof Datum ) {

            for ( const key in this.vertices ) {
                // this is probably up for some regex perf? optimisation...
                if ( key.startsWith ( object.key + '.' ) ) {   
                    let propKey = key.slice ( object.key.length + 1 )
                    // ... because there is another string filter here; TODO
                    if ( ! propKey.includes ( '.' ) ) {
                        object.value[ propKey ] = this.vertices[ key ]()
                    } 
                }
            }
            return object.value
        } 

        else {
        
            for ( const key in this.vertices ) {
                if ( ! key.includes ( '.' ) ) {
                    object[ key ] = this.vertices[ key ]()
                } 
            }
            return object
        }
    }
}

globalThis.Graph            = Graph 
globalThis.Algo             = Algo
globalThis.DatumReturner    = DatumReturner 

