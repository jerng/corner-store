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
        return  {   'Datum.toString/0 returned:' : 
                    {   'a shallow copy of enumerable properties, { ... this }':
                            { ... this },
                        'Object.getOwnPropertyDescriptors ( this )':
                            Object.getOwnPropertyDescriptors ( this )
                    }
                }
    }

    constructor ( ...args ) {
 
        super()

        // initialisers

        Object.defineProperties ( this, {
            
            key     : {
                configurable: true,
                enumerable  : false, 
                value       : undefined,
                writable    : true
            },

            value   : {
                configurable: true,
                enumerable  : false,
                value       : undefined,
                writable    : true
            },

            arrows  : {
                configurable: true,
                enumerable  : false,
                value       : {
                    in      : { 
                        // variousTypeKeys: [ ArrowIn ]
                    },
                    out     : {
                        // variousTypeKeys: [ ArrowOut ]
                    }
                },
                writable    : true
            },

            log     : {
                configurable: true,
                enumerable  : false,
                value       : {
                    gets    : [],   // microtime
                    sets    : [],   // [ microtime, value ]
                    deletes : []    // [ microtime, value ]
                },              // Move to class?
                writable    : true
            },

            cache   : {
                configurable: true,
                enumerable  : false,
                value       : {
                    stale   : false,
                    hits    : [],   // microtime
                    misses  : []    // microtime
                },              // Move to class?
                writable    : true
            },

        } )

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

// data type for use in Datum
//
// This should be made safe by default. No pushing allowed.
class Algo extends Datum {

    toString () {
        return  {   'Algo.toString/0 returned:' : 
                    super.toString()
                }
    }

    constructor ( ... args ) {
        
        super()

        if ( args.length !== 1 ) {
            throw Error (`Algo.constructor : expected one and only one argument, received (${args.length}) arguments`) 
        }
        if ( typeof args[0] !== 'function' ) {
            throw Error (`Algo.constructor : typeof (argument provided) was not 'function'`)
        }

        Object.defineProperty ( this, 'lambda', {
            enumerable  : false,
            value       : args[0]
        } )

        return this

    }

}

// Synonym for Algo.
// Also maybe a perceptron.
class Safe extends Algo {
}

// Pushing should be enabled here.
// Also maybe a neuron.
class Danger extends Safe {
}

// Listeners usually need to have side effects; a listener with handlers that
// could only read memory (but not write it) would be a ... passive listern,
// being practically useless.
//
// Here, how do we expect to trigger events?
class EventListener extends Danger {

}

class Graph extends Datum {

    toString () {
        return  {   'Graph.toString/0 returned:': 
                    super.toString()
                }
    }

    constructor ( ... args ) {

        super()

        // initialisers

        this.key            = ''
        this.value          = {} 

        this.handlers       = this.handlers()    
                          
        this.datumHandler   = {

            apply           : this.handlers.datumHandlerApply,
            deleteProperty  : this.handlers.datumHandlerDeleteProperty,
            get             : this.handlers.datumHandlerGet,
            set             : this.handlers.datumHandlerSet 
        }

        this.graphHandler   = { ... this.datumHandler,

            apply           : this.handlers.graphHandlerApply,
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

    sproutVertex ( key, value ) {

        for ( const subKey in value ) {

            let compoundKey = key + '.' + subKey

            if ( ! this.setVertex ( compoundKey, value[ subKey ] ) )       
            { return false }
        }
        return true
    }

    pruneVertex ( key ) {

        for ( const loopKey in this.value ) {

            if ( loopKey.startsWith ( key + '.' ) ) {
                
                if ( ! this.deleteVertex ( loopKey ) ) { return false }
            }
        }
        return true
    }

    deleteVertex ( key ) {

        if ( ! ( key in this.value ) ) { return true }

        if ( ( typeof this.value[ key ]('datum').value == 'object' ) ) 
        {
            if ( ! this.pruneVertex ( key ) ) { return false }
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

        //console.log(this.value [key]('datum') )

        let datum = this.value[ key ]('datum')

            //console.log ( `graph.getVertex/1 will get graph.value[ '${key
            //}' ]() : `, this.value [ key ]() )

        if ( datum instanceof Algo ) { 
            //console.log (`graph.getVertex/1 will now return datum.value.lambda ( graph.proxy )`)
            return datum.lambda ( this.proxy ) 
        } 

        else

        if ( typeof datum.value == 'object' )
        {
            // Wherein. if we find that the user has previously set an
            // object as the value, we try to intercept the call to that
            // object's properties...
            //console.log (`graph.getVertex/1 : found that datum.value is
            //an object, so will return graph.value ['${key}'] `)

            return this.value[ key ] 
        } 

        else
        { return datum.value } 
    }

    setVertex ( ... args ) {

        let proxiedOldDatum
        let datumToSet

        switch ( args.length ) 
        {
            case 0:
                throw Error (`graph.setVertex/0 called; unsupported arity.`)

            case 1:

                //console.warn (`graph.setVertex/1 : rewrite & test for this branch`)
                
                let keyToSet = args[0]  
                datumToSet   = new Datum ( keyToSet )

                this.value [ datumToSet.key ] 
                    = new Proxy ( datumToSet, this.datumHandler )

                break
        }
        // HEREON: args.length > 1

        let valueToSetType  = typeof args[1]

        let keyToSet     = args[0]
        let valueToSet   = args[1]

            //console.log (`graph.setVertex/[n>1], BEGIN, key:`, keyToSet,
            //'value:', valueToSet)
            //console.log ( `graph.setVertex/[n>1], initial value : `,
            //this.value[keyToSet], `update value:`, valueToSet )

        // If valuetoset is an object ...
        if (    valueToSetType == 'object' 
                || 
                valueToSetType == 'function'    )
        {
            // ... then set all of its child vertices;
            if ( ! this.sproutVertex ( keyToSet, valueToSet ) ) 
            { return false }

            //console.log ( datumToSet.value )
        } 

        // If the node/vertex already exists...
        if ( proxiedOldDatum = this.value[ keyToSet ] ) { 
      
            // ... then check its datum;
            let oldDatum = proxiedOldDatum('unproxy')

            // ... and if the datum's value is an object, then prune the graph;
            if ( typeof oldDatum.value == 'object' ) {
                if ( ! this.pruneVertex ( keyToSet ) ) { return false } 
            }

            // ... and finally update datum.value, but not datum's other
            // properties (arrows, logs, cache);
            datumToSet          = oldDatum
            datumToSet.value    = valueToSet
        }
        else
        { datumToSet = new Datum ( { [keyToSet] : valueToSet } ) }

        // datumToSet MUST BE DEFINED BY THIS POINT...

        // If datumToSet.value is an Algo, call it on a keySniffer to plant Arrows.
            // (But datumToSet IS needed here.)
        if ( datumToSet.value instanceof Algo )
        {

            // Assign all old Datum's enumerable properties except 'lambda' to
            // Algo.
            delete datumToSet.lambda
            delete datumToSet.value

            let algoToSet 
                    =   Object.defineProperties ( 
                            valueToSet, 
                            Object.getOwnPropertyDescriptors ( datumToSet ) )

            //console.log (`graph.setVertex/[n>1] : value instanceof Algo `)
    
            let keySniffer = new Proxy ( {}, {
                
                // If you're pulling data into your Algo, you'll trigger getters
                // on the other Datums-
                get : ( ksTarg, ksProp, ksRcvr ) => {
                  
                    //console.log (`graph.setVertex/[n>1] : Algo : keySnifferHandler.get: `, ksProp)

                    //  Configure (this) dependent to track dependencies:
                    if ( ! ( 'causal' in algoToSet.arrows.in ) ) {
                        algoToSet.arrows.in.causal = []
                    }
                    algoToSet.arrows.in.causal.push ( new ArrowIn ( ksProp) )

                    // WARNING: does not require dependency keys to be in the graph
                    // before dependents are set FIXME
                    //
                    //  Configure dependencies to track (this) dependent:

                    let dependencyDatum = this.value[ ksProp ]('datum')

                        if ( ! ( 'causal' in dependencyDatum.arrows.out ) ) {
                            dependencyDatum.arrows.out.causal = []
                        }

                        //console.log (  algoToSet.key )

                        dependencyDatum
                            .arrows.out.causal.push ( new ArrowOut ( algoToSet.key ) )

                    //console.log (`graph.setVertex/>1 : Algo : keySnifferHandler.get: ended`)

                },

                // If you're pushing data from your Algo, you'll trigger setters
                // on the other Datums-
                set : ( ksTarg, ksProp, ksVal, ksRcvr ) => {

                    //console.log (`graph.setVertex/[n>1] : Algo : keySnifferHandler.set, ksProp:`, ksProp, 'ksVal:', ksVal)

                    //  Configure (this) dependency to track dependents:
                    if ( ! ( 'causal' in algoToSet.arrows.out ) ) {
                        algoToSet.arrows.out.causal = []
                    }
                    algoToSet.arrows.out.causal.push ( new ArrowOut ( ksProp ) )

                        //console.log (`graph.setVertex/[n>1] : Algo : keySnifferHandler.set: ArrowOut-s inserted at:`, key )

                    //  Configure dependents to track (this) dependency:
                    if ( ! ( ksProp in this.value ) ) {
                        this.setVertex ( ksProp, undefined ) 
                    }
                    let dependentDatum = this.value[ ksProp ]('datum')

                        if ( ! ( 'causal' in dependentDatum.arrows.in ) ) {
                            dependentDatum.arrows.in.causal = []
                        }
                        dependentDatum
                            .arrows.in.causal.push ( new ArrowIn ( algoToSet.key ) )

                        //console.log (`graph.setVertex/[n>1] : Algo : keySnifferHandler.set: ArrowIn-s inserted at:`, ksProp )
                    
                    return true // FIXME: arrows unchecked?
                }
            } )

            //console.log (`graph.setVertex/>1 : Algo : BEFORE value.lambda(keySniffer), value.lambda: `, value.lambda)

            
            // Detect dependencies and plant arrows.
            algoToSet.lambda ( keySniffer )

            //console.log (`graph.setVertex/>1 : Algo : AFTER value.lambda(keySniffer)`)

            // console.log ( algoToSet.toString() )

            this.value [ keyToSet ]
                = new Proxy ( algoToSet, this.datumHandler )   

              //console.log( `graph.setVertex/[n>1], END, key:`, keyToSet, 'value:',
              //this.value [ keyToSet ]('datum'), 'success check components :', this.value [ keyToSet
              //]('datum'),'==', args[1] ,'result:', this.value [ keyToSet ]('datum') == args[1] )

            // redundant? check
            return  ( this.value [ keyToSet ]('datum') == args[1] ) 
                    ? true
                    : false

        } // (value instanceof Algo)

        else {  
            
            this.value [ datumToSet.key ] 
                    = new Proxy ( datumToSet, this.datumHandler )   

              //console.log( `graph.setVertex/[n>1], END, key:`, keyToSet, 'value:',
              //this.value [ keyToSet ](), 'success check components :', this.value [ keyToSet
              //](),'==', args[1] )

            // redundant? check
            return  ( this.value [ keyToSet ]() == args[1] ) 
                    ? true
                    : false
        }


    }
  
    handlers () { return {
    'datumHandlerDeleteProperty': ( targ, prop ) => {
        return this.deleteVertex ( prop )    
    },
    'datumHandlerGet':  ( targ, prop, rcvr ) => {

        //console.log (`graphHandler.get : graph.value['${prop}'].`)
        let compoundKey = ( targ.key ? targ.key + '.' : '' ) + prop
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler

        //console.log ( compoundKey )
        //console.log ( graph.value )
        return this.getVertex ( compoundKey )
    },
    'datumHandlerSet' : ( targ, prop, val, rcvr) => {

        //console.log ( `graphHandler.set : Try to set
        //graph.value['${prop}'] to (${val}).` ) 
        let compoundKey = ( targ.key ? targ.key + '.' : '' ) + prop
            // performance optimisation opportunity? resplit datumHandler and
            // graphHandler

        //console.log ( compoundKey,  this.value )
        return  this.setVertex ( compoundKey, val )
    },
    'datumHandlerApply' : ( targ, thisArg, args ) => { 
                 
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
    },
    'graphHandlerApply': ( targ, thisArg, args ) => { 
           
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
                    case 'vertices' :
                        return targ.value // unambiguous; 'this' would be  ambiguous 
                    
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
    }   }
      

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
