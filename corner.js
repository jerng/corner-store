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
        // delegated to Graph.graphHandler.set

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

class Datum extends Function {

    toString () {
        return  [   'Datum.toString/0 returned:',
                    [   'a shallow copy of enumerable properties, { ... this }',
                        { ... this }
                    ],
                    [   'Object.getOwnPropertyDescriptors ( this )',
                        Object.getOwnPropertyDescriptors ( this )
                    ],
                ]
    }

    constructor ( ...args ) {
 
        super()

        // initialisers
        this.key
        this.value

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
            case 0 :
                // Allow this through, for Graph subclass
                return
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

class Graph extends Datum {

    toString () {
        return  [   'Graph.toString/0 returned:', 
                    super.toString()
                ]
    }

    constructor ( ... args ) {

        super()

        // initialisers

        this.key            = ''

        this.value          = {} 

        this.datumHandler   = {

            apply           : this.datumHandlerApply,
            deleteProperty  : this.datumHandlerDeleteProperty,
            get             : this.datumHandlerGet,
            set             : this.datumHandlerSet 
        }

        this.graphHandler   = { ... this.datumHandler,

            apply           : this.graphHandlerApply,
        }                               // overwrites datumHandlerApply


        this.proxy          = new Proxy ( this, this.graphHandler )

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
                            server      : this.proxy  }

            case 1:
                switch ( args[0] ) {
                    case 'server':
                        return this.proxy

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

        if ( ! ( key in this.value ) ) { return true }

        // delete subkeys
        if ( ( typeof this.value[ key ]('datum').value == 'object' ) ) 
        {
            for ( const loopKey in this.value ) {

                if ( loopKey.startsWith ( key + '.' ) ) {
                    
                    if ( ! this.deleteVertex ( loopKey ) ) { return false }
                }
            }
        }
        
        delete this.value[ key ]

        return ! ( key in this.value )
    }

    getVertex ( key ) {
        if ( ! ( key in this.value ) )
        { 
            //console.log(this)
            //console.log (`graph.getVertex/1 could not find the key (${key}) in
            //graph.value`)

            return undefined 
        }

        let value = this.value[ key ]()
            //console.log ( `graph.getVertex/1 will get graph.value[ '${key
            //}' ]() : `, this.value [ key ]() )

        if ( value instanceof Algo ) { 
            //console.log (`graph.getVertex/1 will now return datum.value.lambda ( graph.proxy )`)
            return value.lambda ( this.proxy ) 
        } 

        else

        if ( typeof value == 'object' )
        {
            // Wherein. if we find that the user has previously set an
            // object as the value, we try to intercept the call to that
            // object's keyerties...
            //console.log (`graph.getVertex/1 : found that datum.value is
            //an object, so will return graph.value ['${key}'] `)

            return this.value[ key ] 
        } 

        else
        { return value } 
    }

    setVertex ( ... args ) {
        //  TODO? : aliases
        //  this.c = this.createVertice 

        let datum

        switch ( args.length ) 
        {
            case 0:
                throw Error (`graph.setVertex/0 called; unsupported arity.`)

            case 1:

                console.warn (`graph.setVertex/1 : rewrite & test for this branch`)
                
                let key = args[0]  

                datum   = new Datum ( key )

                this.value [ datum.key ] 
                    = new Proxy (  datum, this.datumHandler )

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
                  
                    //console.log (`graphHandler.set, val is an Algo, :`,
                    //this.value[ ksProp ]('Datum') )

                    //  Configure (this) dependent to track dependencies:
                    if ( ! ( 'causal' in datum.arrows.in ) ) {
                        datum.arrows.in.causal = []
                    }

                    datum.arrows.in.causal.push ( new ArrowIn ( ksProp) )

                    // WARNING: does not require dependency keys to be in the graph
                    // before dependents are set FIXME
                    //
                    //  Configure dependencies to track (this) dependent:

                    let dependencyDatum = this.value[ ksProp ]('datum')

                        if ( ! ( 'causal' in dependencyDatum.arrows.out ) ) {
                            dependencyDatum.arrows.out.causal = []
                        }

                        dependencyDatum
                            .arrows.out.causal.push ( new ArrowOut ( key) )
                },
                set : ( ksTarg, ksProp, ksVal, ksRcvr ) => {

                    //  Configure (this) dependency to track dependents:
                    if ( ! ( 'causal' in datum.arrows.out ) ) {
                        datum.arrows.out.causal = []
                    }

                    datum.arrows.out.causal.push ( new ArrowOut ( ksProp) )

                    //  Configure dependents to track (this) dependency:
                    if ( ! ( ksProp in this.value ) ) {
                        this.setVertex ( ksProp, undefined ) 
                    }
                    let dependentDatum = this.value[ ksProp ]('datum')
                        if ( ! ( 'causal' in dependentDatum.arrows.in ) ) {
                            
                            dependencyDatum.arrows.in.causal = []
                        }
                        dependentDatum
                            .arrows.in.causal.push ( new ArrowIn ( key) )
                }
            } )

            // Detect dependencies and plant arrows.
            value.lambda ( keySniffer )

        } // (value instanceof Algo)

        this.value [ datum.key ] 
            = new Proxy ( datum, this.datumHandler )

        //console.log( `graph.setVertex/[n>1] :`, datum.key, this.value [ datum.key ]() )

        // redundant? check
        return  ( this.value [ datum.key ]() == args[1] ) 
                ? true
                : false
    }


    datumHandlerApply = ( targ, thisArg, args ) => { 
                 
        switch ( args.length ) {

            case 0:
                //console.log (`graph.datumHandler.apply/0 : (DATUMKEY, DATUMVALUE,
                //    thisArg, args) `, targ().key,
                //    targ().value, thisArg, args )

                let datum = targ
                return  typeof datum.value == 'object'
                            ? this.recoverEnumerableProperties ( datum )
                            : datum.value
            case 1:
                //console.log (`graph.datumHandler.apply/1 : `)

                switch (args[0]) {

                    case 'unproxy':
                        return targ // unambiguous; 'this' would be  ambiguous 

                    case 'gopds' :
                        return Object.getOwnPropertyDescriptors ( this )
                    
                    // DIFFERENT FROM Graph
                    case 'datum':
                        return targ // unambiguous; 'this' would be  ambiguous 

                    default:
                        throw Error (`graph.datumHandleApply/1 : the argument was
                        not understood`)
                }

            default:
                throw Error (`graph.datumHandlerApply/n, where arity-n has no defined branch`)
        }
    }

    datumHandlerDeleteProperty = ( targ, prop ) => {
        return this.deleteVertex ( prop )    
    }

    datumHandlerGet = ( targ, prop, rcvr ) => {

        //console.log (`graphHandler.get : graph.value['${prop}'].`)
        let compoundKey = ( targ.key ? targ.key + '.' : '' ) + prop
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler

        //console.log ( compoundKey )
        //console.log ( graph.value )
        return this.getVertex ( compoundKey )
    }

    datumHandlerSet = ( targ, prop, val, rcvr) => {

        //console.log ( `graphHandler.set : Try to set
        //graph.value['${prop}'] to (${val}).` ) 
        let compoundKey = ( targ.key ? targ.key + '.' : '' ) + prop
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler

        //console.log ( compoundKey )
        //console.log ( graph.value )
        return  this.setVertex ( compoundKey, val )
    }

    graphHandlerApply = ( targ, thisArg, args ) => { 
           
        switch ( args.length ) {
            case 0:
                //return this.recoverEnumerableProperties ( {} )
                let datum = targ
                return  typeof datum.value == 'object'
                            ? this.recoverEnumerableProperties ( datum )
                            : datum.value
            
            case 1:
                switch ( args[0] ) {

                    /*
                    case 'node' :
                        // Serl Node, TODO
                        break
                    */

                    case 'unproxy':
                        return targ // unambiguous; 'this' would be  ambiguous 

                    case 'gopds' :
                        return Object.getOwnPropertyDescriptors ( this )
                    
                    // DIFFERENT FROM Datum 
                    case 'graph' :
                        return targ // unambiguous; 'this' would be  ambiguous 
                    
                    // DIFFERENT FROM Datum 
                    case 'server' :
                        return this.proxy 
                    
                    default:
                        throw Error (`graph.graphHandlerApply/1 called;
                        the argument was not understood`)
                }    
            
            default:
                throw Error (`graph.graphHandlerApply/n called, where no
                branch is defined for arity-n`)
        }
    
    }

    graphHandlerDeleteProperty = ( targ, prop ) => {
        return this.datumHandlerDeleteProperty (targ, prop )
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler
    }
    
    graphHandlerGet = ( targ, prop, rcvr ) => {
        return this.datumHandlerGet ( targ, prop, rcvr ) 
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler
    }
    
    graphHandlerSet = ( targ, prop, val, rcvr ) => {
        return this.datumHandlerSet ( targ, prop, val, rcvr )
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler
    }

    //  Operates on an instance of Datum, whose value has typeof 'object'
    // 
    //  Generally used to unflatten vertices from the graph index, before
    //  returning the unflatted object to the user.
    //
    recoverEnumerableProperties ( object ) {

        //console.log (`graph.recoverEnumerableProperties/1`)

        if ( object instanceof Datum ) {

            for ( const key in this.value ) {
                // this is probably up for some regex perf? optimisation...
                if ( key.startsWith ( object.key + '.' ) ) {   
                    let propKey = key.slice ( object.key.length + 1 )
                    // ... because there is another string filter here; TODO
                    if ( ! propKey.includes ( '.' ) ) {
                        object.value[ propKey ] = this.value[ key ]()
                    } 
                }
            }
            return object.value
        } 

        else {
        
            for ( const key in this.value ) {
                if ( ! key.includes ( '.' ) ) {
                    object[ key ] = this.value[ key ]()
                } 
            }
            return object
        }
    }
}

globalThis.Algo     = Algo
globalThis.Datum    = Datum
globalThis.Graph    = Graph 