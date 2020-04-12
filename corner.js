export { Datum, Graph, Script }
import * as d3 from 'https://d3js.org/d3.v5.js'

// data type for use in Datum
class PointerOut {
    constructor ( _okey ) {
        this.okey   = _okey
        this.gets   = new EventLog 
        return this
    }
}

// data type for use in Datum
class PointerIn {
    constructor ( _ikey ) {
        this.ikey   = _ikey
        this.gets   = new EventLog   
        return this
    }
}

// data type for use in Datum
// performance.now() logs in milliseconds
class EventLog {
    
    constructor () {
        this.book = []
        return this 
    }

    note ( preferATimeStampBoxedValue  ) {
        this.dispatch ( preferATimeStampBoxedValue ) 
        this.actuallyNote ( preferATimeStampBoxedValue ) 
            //console.log ( this.book[ this.book.length -1 ] )
    }

    // (graph) is optional
    actuallyNote ( boxedValue ) {
        this.book.push( boxedValue )
    }

    async dispatch ( boxedValue ) {}
        // Interpreter should inline this out of existence unless
        // emit actually does something in a subclass

    static time () { return performance.now() }

    static timeStampBox ( value ) {
        return { 
            time    :   EventLog.time(), 
            value   :   value
        }
    }
}

// DOM already has an EventTarget class.
class AsyncDispatcher extends EventLog {
    
    constructor () {

        super()
            //this.queue = []
            // .push() to add on the right
            // .shift() to remove on the left

//console.error (`WIP here - get reactive Scripts running.`)

            // Task class?
        this.tasks = { } 

            // Don't put (new Promise)s here, as their executors will start
            // running immediately. Only put functions which return (new
            // Promise)s in order that Promise executors are run only when the
            // function is applied.

            // EXAMPLE TASK:
            // (key) is not yet used.
            //'1TEST' : args => new Promise ( ( fulfill, reject ) => {
            //function primeFactorsTo(max) { var store  = [], i, j, primes = []; for (i = 2; i <= max; ++i) { if (!store [i]) { primes.push(i); for (j = i << 1; j <= max; j += i) { store[j] = true; } } } return primes; } 

            //setTimeout( ()=>{ fulfill ( [ args, primeFactorsTo ( Math.pow ( 8, 7 ) ) ] ) }, 3000 ) 
            //            } )    

        return this 
    }

    // overwrites parent class method:
    // 
    //  1.  See below.
    //  2.  In order to be able to use 'await', we need to make (dispatch) an
    //      AsyncFunction. The functional difference is, while (dispatch) will
    //      asynchronously 'await' task execution, (dispatch's calling function)
    //      will proceed synchronously without waiting for (dispatch).
    async dispatch( boxedValue ) {
        let resolvedPromises = await Promise.all (
            Object.values ( this.tasks ) .map ( t => t( boxedValue ) )
        )
        this.actuallyNote ( {
            time        : EventLog.time(),
            resolution  : resolvedPromises
        } ) 
            // logs own events to self!
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

    toString () { return  {   
        'Datum.toString/0 returned:' : {
            
            'a shallow copy of enumerable properties, { ... this }': { 
                ... this 
             },
            
            'Object.getOwnPropertyDescriptors ( this )':
                Object.getOwnPropertyDescriptors ( this )
        }
    } }

    constructor ( ...args ) {
 
        //super()

        // initialisers
        Object.defineProperties ( this, {
            
            // This is used to enable proxied application
            proxyTarget     : {
                configurable: true,
                enumerable  : false, 
                value       : Object.defineProperty( 
                    ()=>{}, 
                    'datum', 
                    {'value' : this }                  
                ),
                writable    : true
            },

            // This is used as the id.
            key     : {
                configurable: true,
                enumerable  : false, 
                value       : undefined,
                writable    : true
            },

            // This is used both by Datum and its subclass Fun. 
            // In Fun, it is used to store the return value of Scripts.
            value   : {
                configurable: true,
                enumerable  : false,
                value       : undefined,
                writable    : true
            },

            // These are used to store edges or pointers between data.
            pointers  : {
                configurable: true,
                enumerable  : false,
                value       : {
                    in      : { // variousTypeKeys: [ PointerIn ]
                    },
                    out     : { // variousTypeKeys: [ PointerOut ]
                    }
                },
                writable    : true
            },

            // This is used to mark a stale cache.
            stale   : {
                configurable: true,
                enumerable  : false,
                value       : false,    
                writable    : true
            },

            log     : {
                configurable: true,
                enumerable  : false,
                value       : {         
                    gets    : {
                        hits    : new EventLog,   
                        misses  : new EventLog    
                    },   
                    sets    : new AsyncDispatcher, 

                  //deletes : []        // [ microtime, value ]
                    // This doesn't quite work that way for now. When we delete
                    // a Datum, we really expunge it from the Graph.
                    // Maybe this can change in the future. TODO

                  // Should we log cache invalidations?

                    setsPointerIn   : new EventLog,
                    setsPointerOut  : new EventLog,

                    getsPointerIn   : new EventLog,
                    getsPointerOut  : new EventLog,

                },                                              
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

//  Generally, when defining a Script:
//  
//  DEFAULT (UNSAFE_COMPUTED_SOURCE pattern):
//
//  {   hasSources      : TRUE,     // T: can read from graph
//      exclusiveGets   : FALSE,    // T: monopolises source reads
//      firmSources     : FALSE,    // T: blocks source deletion
//      
//      hasSinks        : TRUE,     // T: can write to graph
//      exclusiveSets   : FALSE,    // T: monopolises sink writes
//      firmSinks       : FALSE,    // T: blocks sink deletion
//        
//      cached          : TRUE,     // T: lazy updates
//      reactive        : FALSE,    // T: active updates, on source changes
//
//      setHandler      : FALSE,    // T: code run by proxyHandler.set
//      getHandler      : TRUE,     // T: code run by proxyHandler.get
//
//  }     
//        







//  SAFE_COMPUTED_SOURCE pattern, differences from default:
//      
//  {   hasSinks        : FALSE   
//      firmSources     : TRUE      } 
//      
//  UNSAFE_COMPUTED_SINK pattern, difference from defaults:    
//      
//  {   setHandler      : TRUE
//      getHandler      : FALSE     }
//      
//  PRIVILEGED_READER pattern, differences from default:
//      
//  {   exclusiveGets   : TRUE   
//      firmSources     : TRUE      } 
//      
//  PRIVILEGED_WRITER pattern, differences from default:
//      
//  {   exclusiveSets   : TRUE   
//      firmSinks       : TRUE      } 
//      
//  CHANGE_HANDLER pattern, differences from default:
//
//  {   reactive        : TRUE   
//      firmSources     : TRUE      } 
//      
//  REPORTER pattern, differences from default:
//
//  {   reactive        : TRUE   
//      firmSinks       : TRUE      } 
//      
//  ACTIVE_WORKER pattern, differences from default:
//      
//  {   firmSources     : TRUE  
//      firmSinks       : TRUE
//      cached          : FALSE 
//      reactive        : TRUE      }
//
//  PRIVILEGED_WORKER pattern, differences from default:
//      
//  {   firmSources     : TRUE  
//      firmSinks       : TRUE
//      exclusiveGets   : TRUE
//      exclusiveSets   : TRUE
//      cached          : FALSE 
//      reactive        : TRUE      }
//      
//      
//      reactive        : TRUE,    
//  }     
//        
//  {   hasSources         : true,    
//      exclusiveGets   : false,   
//      firmSources     : false,   
//      
//      hasSinks           : true,    
//      exclusiveSets   : false,   
//      firmSinks       : false,    
//         
//      cached          : true,     
//      reactive        : TRUE,    
//  }     
//        

////////////////////////////////////////////////////////////////////////////////
//  Discussion: I originally named the class "Algo", which is nice and short.
//  But I realised later the code stored here is not always algorithmic
//  (algorithms must end in a finite number of steps). These are more open-ended
//  anonymous functions. Factors to consider in naming:
//
//  -   Fewest characters to type
//  -   Easy to pronounce, and does not clash with common Javascript morphemes
//  -   Accurately describes what the thing is: code stored as data
//
//  Some candidates for discussion:
//
//  -   "P roc"  "P rocedure"
//  -   "F un"  "P rog"  "P rogram"
//  -   "S ub"  "R outine"  "S ubroutine"
//  -   Probably too conflicty: "S ervice" "E xec" 
//
//  Concluding:
//
//  Suggestions received:
//  - Procedure StoredProcedure
//  - ScriptNode Script
//  - Clodes Stodes
//  - MetaData
//  - Snippets
//  - Trigger
//  - Fun
//  - LambdaFunction Lambda
//  - pick a unicode character like λ
//
//  Next thoughts, I'm still rather preferential towards any name of four characters
//  or less. Looking at the intersection of <five character morphemes which are also
//  semantically accurate, and easy to speak, and easy to write, and un-confusable
//  with existing Javascript ontology...
//
//  ... first up, I'm thinking that perhaps the class should never be extended in
//  the system just so that users can extend it and use any morpheme that they
//  want...
//
//  ... that being said, it still needs a canonical name. Here's the shortlist:
//
//  - Script (probably semantically unsound, as it'd get mixed up with modules)
//
//  ... here's what's left:
//
//  - O p                : not an opcode by a long shot
//  - F un               : too close to native morpheme
//  - C ode - "a code"   : spoken clumsily
//  - L ambda            : too close to native morpheme
//  - A non
//
//  On one hand, Script fits with the rule of naming brandy things with harsh
//  syllables. On the other, Lambda and Script are much more specific about what we're
//  actually parking at those nodes. Script is cute, but seems a bit distracting.
//  Will continue to ruminate on the shortlist for a bit.
//
//  ---
//  Someone suggested NoFun for optimal confusion. Another wanted CoLaDa.
//  I think we're down to a single-syllable shootout, sorted by minimalism:
//
//  - O p
//  - F un (typing F is leftier)
//  - L am (typing L is rightier)
//  - C ode (the only unabbreviated remainer)
//
//  ---
//  Further rumination brings us back to:
//
//  - S cript    : morphology is too common
//  - A non      : easier to type; but not actually anonymous!
//
////////////////////////////////////////////////////////////////////////////////
//
// args[0] must be function
// args[0] must be an object of traits
class Script extends Datum {

    toString () {
        return  {   'Fun.toString/0 returned:' : 
                    super.toString()
                }
    }

    constructor ( ... args ) {
        
        super()

//      // Configuration (initialised by super())
//      // OVERRIDES Datum.log.sets
//      this.log.sets = {
//          pointers : new EventLog,
//          value : new AsyncDispatcher
//      }

        switch ( args.length ) {
            case 0:
                throw Error (`Fun.constructor/0 : we require more arguments`) 
            case 1:
                // allowed!
            case 2:
                // allowed!
                break
            default:
                throw Error (`Fun.constructor/${args.length} called, branch for this arity is undefined.`)
        }

        if ( typeof args[0] !== 'function' ) {
            throw Error (`Fun.constructor : first argument must be a 'function'`)
        }

        Object.defineProperty ( this, 'lambda', {
            configurable: true,
            enumerable  : false,
            value       : args[0],
            writable    : true
        } )

        Object.defineProperty ( this, 'traits', {
            configurable: false,
            enumerable  : false,
            value       : {

                // UNIMPLEMENTED FEATURES:

                hasSources      : true, 
                //exclusiveGets   : false,
                //firmSources     : false,

                hasSinks        : true, 
                //exclusiveSets   : false,
                //firmSinks       : false,
                    
                cached          : true, 
                //reactive        : false,

                //setHandler      : false,
                 
                getHandler      : true, 
             
                // DEFAULT VALUES are overwritten by ...
                ... args[1] // the second argument

            },
            writable    : false 
        } )

        return this

    }

}

class Graph extends Datum {

    toString () {
        return  {   'Graph.toString/0 returned:': 
                    super.toString()
                }
    }

    constructor ( ... args ) {

        super()

        // configuration (initialised by super())
        this.key            = ''
        this.value          = {} 
        this.log.canon      = new AsyncDispatcher

        // an alias
        Object.defineProperty ( this.proxyTarget, 'graph', {
            enumerable  : false, 
            value       : this.proxyTarget.datum,
        } )

        // further initialisers

        Object.defineProperty ( this, 'handlers', {
            enumerable  : false, 
            value       : this.handlers(),
        } )

        Object.defineProperty ( this, 'datumHandler', {
            enumerable  : false, 
            value       : {
                apply           : this.handlers.datumHandlerApply,
                deleteProperty  : this.handlers.datumHandlerDeleteProperty,
                get             : this.handlers.datumHandlerGet,
                set             : this.handlers.datumHandlerSet 
            }
        } )

        Object.defineProperty ( this, 'graphHandler', {
            enumerable  : false, 
            value       : { 
                
                ... this.datumHandler,
                
                apply           : this.handlers.graphHandlerApply,
            }                              // overwrites datumHandlerApply
        } )

        Object.defineProperty ( this, 'proxy', {
            enumerable  : false, 
            value       : new Proxy ( this.proxyTarget, this.graphHandler )        
        } )

        Object.defineProperty ( this, 'proxyGetOnly', {
            enumerable  : false, 
            value       : new Proxy (   this.proxyTarget, 
                                        { get : this.handlers.datumHandlerGet } )        
        } )

        Object.defineProperty ( this, 'proxySetOnly', {
            enumerable  : false, 
            value       : new Proxy (   this.proxyTarget, 
                                        { set : this.handlers.datumHandlerSet } )        
        } )

        Object.defineProperty ( this, 'proxySetGetOnly', {
            enumerable  : false, 
            value       : new Proxy (   this.proxyTarget, 
                                        { set : this.handlers.datumHandlerSet, 
                                          get : this.handlers.datumHandlerGet } )        
        } )


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
                            store      : this.proxy  }

            case 1:
                switch ( args[0] ) {
                    case 'store':
                        return this.proxy

                    case 'proxyTarget':
                        return this.proxyTarget // () => this 
                        
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

    logFormat ( typeString, vertexObject, time ) {
        return  {
                    time        : time,
                    datum       : vertexObject,
                    type        : typeString
                }
    }

    runScriptAndLog ( datum ) {
                //console.log (`graph.vertexGetTyped/1 will now return datum.stale : `,
                //datum.stale, 'datum.value', datum.value, 'datum.key', datum.key )
          
        let result

        if ( datum.stale || ! datum.traits.cached ) {
            // !stale && !cached
            // stale && !cached 
            // stale && cached  
           
            // Is there a more efficient way to do this?
            let proxy 
                = datum.traits.hasSources
                ? ( datum.traits.hasSinks
                    ? this.proxySetGetOnly
                    : this.proxyGetOnly 
                  )
                : ( datum.traits.hasSinks
                    ? this.proxySetOnly
                    : this
                  )
            result      = datum.value = datum.lambda ( proxy )

            datum.stale = false

            // LOGGING - CACHE MISS 
            let timeStampBoxedValue = EventLog.timeStampBox ( result )
            datum.log.gets.misses.note ( timeStampBoxedValue )
            this.log.canon.note ( this.logFormat (
                'get_vertex_miss_runScriptAndLog',
                datum,
                timeStampBoxedValue.time
            ) )
        }

        else {
            // !stale && cached
        
            result = datum.value        
            // cache hit, scenario 1 of 3; a Script

            datum.stale = false // for general coherence

            //  LOGGING - CACHE HIT - more scenarios in vertexGetTyped; more
                    // scenarios in graphHandlerApply, datumHandlerApply
            let timeStampBoxedValue = EventLog.timeStampBox ( result )
            datum.log.gets.hits.note ( timeStampBoxedValue )
            this.log.canon.note ( this.logFormat (
                'get_vertex_hit_runScriptAndLog',
                datum,
                timeStampBoxedValue.time
            ) )
        }                                   

        return result
    }

    vertexDelete ( key ) {
        if ( ! ( key in this.value ) ) { return true }

        if ( ( typeof this.value[ key ]('datum').value == 'object' ) ) 
        {
            if ( ! this.vertexPrune ( key ) ) { return false }
        }
        let deletedDatum = this.value[ key ]('unproxy').datum

        delete this.value[ key ]
        let success = ! ( key in this.value )

        // LOGGING
        if ( success ) {
            let timeStampBoxedValue = EventLog.timeStampBox ( deletedDatum )
            this.log.canon.note ( this.logFormat (
                'delete_vertex_vertexDelete',
                deletedDatum,
                timeStampBoxedValue.time
            ) )
            // Only time stamp is needed; refactoring may make this more
            // efficient later. FIXME
        }
            
        return success 
    }

    vertexGet ( key ) {
        if ( ! ( key in this.value ) )
        { 
            //console.log(this)
            //console.log (`graph.vertexGet/1 could not find the key (${key}) in
            //graph.value`)

            return undefined 
        }

            //console.log ( `vertexGet/1, BEFORE getting Datum`,key )

        let datum = this.value[ key ]('datum')

            //console.log ( `vertexGet/1, AFTER getting Datum`, key )
            //console.log ( `graph.vertexGet/1 will get graph.value[ '${key
            //}' ]() : `, this.value [ key ](), datum.traits )

        return this.vertexGetTyped ( datum ) 
    }

    // Lower-level call, used by 
    //      vertexGet 
    //      datumHandlerApply
    //      graphHandlerApply
    vertexGetTyped ( datum ) {

            //console.log ( `vertexGetTyped`, datum )

        let result 

        if ( datum instanceof Script && datum.traits.getHandler ) { 
            return this.runScriptAndLog ( datum ) 
        }

        else
        if ( typeof datum.value == 'object' ) { // ( 'function's are not sprouted )

            // Wherein. if we find that the user has previously set an
            // object as the value, we try to intercept the call to that
            // object's properties...

            //console.log (`graph.vertexGet/1 : found that datum.value is
            //an object, so will return graph.value ['${key}'] `)

            
                    result = this.value[ datum.key ]  
                    // cache hit, scenario 1 of 2; not a Script, no cache 
        }                                           

        else {      result  =  datum.value      
                    // cache hit, scenario 2 of 2; not a Script, no cache  
        }                                           

        // LOGGING - 2 cache hit scenarios in vertexGetTyped; more scenarios in 
        //              graphHandlerApply, datumHandlerApply, runFun

        //console.log(datum, this.value[key])
        let timeStampBoxedValue = EventLog.timeStampBox ( result )
        datum.log.gets.hits.note ( timeStampBoxedValue )
        this.log.canon.note ( this.logFormat (
            'get_vertex_hit_vertexGetTyped',
            datum,
            timeStampBoxedValue.time
        ) )
        
        return result
    }    

    //  Deletes all child vertices.
    //  Prune is to Sprout, what Delete is to Update.
    vertexPrune ( key ) 
    {

        for ( const loopKey in this.value ) {

            if ( loopKey.startsWith ( key + '.' ) ) {
                
                if ( ! this.vertexDelete ( loopKey ) ) { return false }
            }
        }
        return true
    }

    vertexSet ( ... args ) 
    {

        //console.log(`graph.vertexSet/n START`)

        let datumToSet

        switch ( args.length ) 
        {
            case 0:
                throw Error (`graph.vertexSet/0 called; unsupported arity.`)

            case 1:

                //console.warn (`graph.vertexSet/1 : rewrite & test for this branch`)
                
                let keyToSet = args[0]  
                datumToSet   = new Datum ( keyToSet )

                this.value [ datumToSet.key ] 
                    = new Proxy ( datumToSet.proxyTarget, this.datumHandler )

                break
        }
        // HEREON: args.length > 1

        //console.log(`graph.vertexSet/[n>1] checked`)

        let valueToSetType  = typeof args[1]

        let keyToSet     = args[0]
        let valueToSet   = args[1]

            //console.log (`graph.vertexSet/[n>1], BEGIN, key:`, keyToSet,
            //'value:', valueToSet)
            //console.log ( `graph.vertexSet/[n>1], initial value : `,
            //this.value[keyToSet], `update value:`, valueToSet )

        let proxiedOldDatum
        
        // If the node/vertex does not yet exist ...
        if ( ! ( proxiedOldDatum = this.value[ keyToSet ] ) ) {

            datumToSet = new Datum ( { [keyToSet] : valueToSet } )
        }
         
        else { // ... the node/vertex already exists...

            // ... then check its datum;
            let oldDatum = proxiedOldDatum('unproxy').datum

                //console.log (oldDatum)

            // ... and if the datum's value is an object, then prune the graph;
            if ( typeof oldDatum.value == 'object' ) {
                if ( ! this.vertexPrune ( keyToSet ) ) { return false } 
            }

            // ... and finally update datum.value, but not datum's other
            // properties (pointers, logs, cache);
            datumToSet          = oldDatum
            datumToSet.value    = valueToSet
        }

            //console.log(`graph.vertexSet/[n>1] datumToSet has been defined.`)

// datumToSet MUST BE DEFINED BY THIS POINT...

        // If datumToSet.value IS a Script, call it on a keySniffer to plant pointers.
        if ( datumToSet.value instanceof Script )
        {
                //console.log (`graph.vertexSet/[n>1] : value instanceof Script `)

            // Assign all old Datum's own properties except (those listed below) to Fun.
            delete datumToSet.lambda
            delete datumToSet.value
            delete datumToSet.proxyTarget

            let scriptToSet 
                    =   Object.defineProperties ( 
                            valueToSet, 
                            Object.getOwnPropertyDescriptors ( datumToSet ) )
    
            scriptToSet.stale = true
                // Script will not run until the next get (no gets here)
                //
                // Whether Fun.traits.cached is true or not, the Fun.stale
                // property will be defined. Because it is defined for all
                // Datum, and Script extends Datum.

            this.value [ keyToSet ]
                = new Proxy ( scriptToSet.proxyTarget, this.datumHandler )   

                //console.log(  `graph.vertexSet/[n>1], Fun, AFTER SET,
                //keyToSet:`, keyToSet, 
                //  'value which was set:', this.value [ keyToSet ]('datum'), 
                //  'success check components :', this.value [ keyToSet ]('datum'),'==', args[1] ,
                //  'result:', this.value [ keyToSet ]('datum') == args[1] )

            let result = this.value [ keyToSet ]('datum') == args[1] 
            
            //  console.log (`graph.vertexSet/[n>1], Fun, result obtained: result`)
            //  console.log (this.value [ keyToSet ]('datum').traits)

            if ( result ) {
            
                // LOGGING - 1 scenario (1 of 2 in vertexSet/n)
                let timeStampBoxedValue =  EventLog.timeStampBox ( { 
                    'Script instance'  :   scriptToSet ,
                    'FIXME'         :   `Placeholder log format for Fun, because
                                         Fun.toString/n doesn't handle circular
                                         objects yet.`                
                } ) 
                datumToSet.log.sets.note ( timeStampBoxedValue )
                this.log.canon.note ( this.logFormat ( 
                    'set_vertex_Script_vertexSet',
                    scriptToSet,
                    timeStampBoxedValue.time
                ) ) 
            }

////////////////////////////////////////////////////////////////////////////////
            // Detect sinks and sources, and plant pointers.
            //
            // WARNING: filtered for uniqueness.
            //          https://stackoverflow.com/a/14438954/1378390
            
            let sourceKeys = (  scriptToSet.traits.hasSources
                                ? this.handlers.sniffSourceKeys ( scriptToSet.lambda )
                                : []    ).filter((v, i, a) => a.indexOf(v) === i)
                                    
            let sinkKeys   = ( scriptToSet.traits.hasSinks
                                ? this.handlers.sniffSinkKeys   ( scriptToSet.lambda )
                                : []    ).filter((v, i, a) => a.indexOf(v) === i)

            sourceKeys.forEach ( key => {
                this.handlers.setSourcePointer ( scriptToSet, key )
            } )
            sinkKeys.forEach ( key => {
                this.handlers.setSinkPointer   ( scriptToSet, key )
            } )

////////////////////////////////////////////////////////////////////////////////

            //  console.log (`graph.vertexSet/>1 : Script : AFTER
            //      value.lambda(keySniffer)`, scriptToSet.traits )
            //  console.log ( scriptToSet.toString() )

            return result
        } 

        else 
        {  // If datumToSet.value is NOT a Script, then complete the assignment.

            //console.log (`graph.vertexSet/[n>1] : value NOT instanceof Script `)


            // If valuetoset is an object ...
            if ( valueToSetType == 'object' ) // ( 'function's are not sprouted )
            {
            
                //console.log (`graph.vertexSet/[n>1] : value is an object `)

                // ... then set all of its child vertices;
                if ( ! this.vertexSprout ( keyToSet, valueToSet ) ) 
                { return false }
            } 

            //console.log (`graph.vertexSet/[n>1] : value is NOT an object `,
            //datumToSet)
            
            this.value [ datumToSet.key ] 
                    = new Proxy ( datumToSet.proxyTarget, this.datumHandler )   

              //console.log(  `graph.vertexSet/[n>1], END, key:`, keyToSet, 
              //              'value:', this.value [ keyToSet ], 
              //              'success check components :', this.value [ keyToSet ],'==', args[1] ) 

            let result = this.value [ keyToSet ]('unproxy').datum.value == args[1]  
            if ( result ) {
            
                // LOGGING - 1 scenario (2 of 2 in vertexSet/n)
                let timeStampBoxedValue =  EventLog.timeStampBox ( args[1] )
                datumToSet.log.sets.note ( timeStampBoxedValue )
                this.log.canon.note ( this.logFormat ( 
                    'set_vertex_vertexSet',
                    datumToSet,
                    timeStampBoxedValue.time
                ) ) 
            } 
            return result

        } // End of block where: (value instanceof Fun) 

    }
  
    //  Updates all child vertices.
    //  Prune is to Sprout, what Delete is to Update.
    vertexSprout ( key, value ) 
    {

        for ( const subKey in value ) {

            let compoundKey = key + '.' + subKey

            if ( ! this.vertexSet ( compoundKey, value[ subKey ] ) )       
            { return false }
        }
        return true
    }

    handlers () { return {
        'datumHandlerDeleteProperty': ( targ, prop ) => 
        {
            //  (targ) is a (datum instance).proxytarget.
            //
            //  because (datum instance).proxytarget.datum refers to the
            //  instance's (this), therefore, (targ.datum) refers to the underlying
            //  instance.
            //
            //  because this is an aef in a method on graph, (this) here refers to
            //  the instance of graph.
          
            return this.vertexDelete ( prop )    
        },
        'datumHandlerGet':  ( targ, prop, rcvr ) => 
        {
            //  (targ) is a (datum instance).proxytarget.
            //
            //  because (datum instance).proxytarget.datum refers to the
            //  instance's (this), therefore, (targ.datum) refers to the underlying
            //  instance.
            //
            //  because this is an aef in a method on graph, (this) here refers to
            //  the instance of graph.
          

            //console.log (`datumHandler.get : graph.value['${prop}'].`)
            let compoundKey = ( targ.datum.key ? targ.datum.key + '.' : '' ) + prop
                // performance optimisation opportunity? resplit datumHandler and
                // graphHandler

            //console.log ( compoundKey )
            //console.log ( graph.value )
            return this.vertexGet ( compoundKey )
        },
        'datumHandlerSet' : ( targ, prop, val, rcvr) => 
        {
            //  (targ) is a (datum instance).proxytarget.
            //
            //  because (datum instance).proxytarget.datum refers to the
            //  instance's (this), therefore, (targ.datum) refers to the underlying
            //  instance.
            //
            //  because this is an aef in a method on graph, (this) here refers to
            //  the instance of graph.
          
            //console.log ( `datumHandler.set : Try to set graph.value['${prop}'] to (${val}).` ) 

            let compoundKey = ( targ.datum.key ? targ.datum.key + '.' : '' ) + prop
                // performance optimisation opportunity? resplit datumHandler and
                // graphHandler

            //console.log ( compoundKey,  this.value )
            return  this.vertexSet ( compoundKey, val )
        },
        'datumHandlerApply' : ( targ, thisArg, args ) => 
        { 
            //  (targ) is a (datum instance).proxytarget.
            //
            //  because (datum instance).proxytarget.datum refers to the
            //  instance's (this), therefore, (targ.datum) refers to the underlying
            //  instance.
            //
            //  because this is an aef in a method on graph, (this) here refers to
            //  the instance of graph.
          
            //console.log( `datumHandlerApply`, args, targ.key, targ)           
                     
            switch ( args.length ) {

                case 0:

                    //console.log (`graph.datumHandler.apply/0 : (DATUMKEY, DATUMVALUE,
                    //    thisArg, args) `, targ().key,
                    //    targ().value, thisArg, args )

                        //console.log (datum instanceof Graph)
                        //console.log(  datum.value )

                        //console.error (`datum.value; algo not being checked; refer to vset and vget for done code`)
                    

                    //  this.recoverEnumerableProperties recursively calls
                    //  datum() (this block of code)

                    return typeof targ.datum.value == 'object'
                        ? this.recoverEnumerableProperties ( targ.datum )
                        : this.vertexGetTyped ( targ.datum ) 

                case 1:

                    //console.log (`graph.datumHandler.apply/1 : `)

                    switch (args[0]) {

                        case 'unproxy':
                            return targ 

                        case 'gopds' :
                            return Object.getOwnPropertyDescriptors ( targ.datum )
                        
                        case 'datum':
                            return targ.datum 

                        default:
                            throw Error (`graph.datumHandleApply/1 : the argument was
                            not understood`)
                    }

                default:
                    throw Error (`graph.datumHandlerApply/n, where arity-n has no defined branch`)
            }
        },
        'graphHandlerApply': ( targ, thisArg, args ) => 
        { 
            //  (targ) is a (Graph instance).proxyTarget, which means it is also a
            //  (Datum instance).proxyTarget.
            //
            //  Because (Datum/Graph instance).proxyTarget.datum refers to the
            //  instance's (this), therefore, (targ.datum) refers to the underlying
            //  instance.
            //
            //  Because this is an AEF in a method on Graph, (this) here refers to
            //  the instance of Graph.



            //console.log(`graphHandlerApply`,args, targ.key, targ)           

            switch ( args.length ) {

                case 0:

                        //console.log (datum instanceof Graph)
                        //console.log( datum.value )

                    return typeof targ.datum.value == 'object'
                        ? this.recoverEnumerableProperties ( {} )
                        : this.vertexGetTyped ( datum ) 

                case 1:

                    switch ( args[0] ) {

                      //case 'node' :
                      //    // Serl Node, TODO
                      //    break

                        case 'unproxy':
                            return targ 

                        case 'gopds' :
                            return Object.getOwnPropertyDescriptors ( targ.graph )
                        
                        case 'datum':
                            return targ.datum 

                        // just an ALIAS 
                        case 'graph' :
                            return targ.graph 
                        
                        // DIFFERENT FROM Datum 
                        case 'vertices' :
                            return targ.graph.value 
                        
                        // DIFFERENT FROM Datum 
                        case 'store' :
                            return targ.graph.proxy 
                        
                        default:
                            throw Error (`graph.graphHandlerApply/1 called;
                            the argument was not understood`)
                    }    
                
                default:
                    throw Error (`graph.graphHandlerApply/n called, where no
                    branch is defined for arity-n`)
            }
        
        },
        'setSourcePointer': ( scriptToSet, sourceKey ) => 
        {
            // vertexSet is using a keysniffer to get the keys of functions called in
            // Scripts, when the Script is set to the graph.
            //
            // If you're pulling data into your Fun, you'll trigger getters
            // on the other Datums-

            // Deny creation if: SOURCE not yet exists.
            // Note the asymmetry with ---HandlerSet

            if ( ! ( sourceKey in this.value ) ) {
                throw Error (`graph.vertexSet/n tried to set a Script, but the
                        Script referred to a source address which has not been
                        set: (${ sourceKey })`)
            }

            //  Configure (this) dependent to track dependencies:
            //  RECORD POINTERS IN

            if ( ! ( 'causal' in scriptToSet.pointers.in ) ) {
                scriptToSet.pointers.in.causal = []
            }
            let pointerIn = new PointerIn ( sourceKey)
            scriptToSet.pointers.in.causal.push ( pointerIn )

            // LOGGING
            let timeStampBoxedPointerIn = EventLog.timeStampBox ( pointerIn )
            scriptToSet.log.setsPointerIn
                .note ( timeStampBoxedPointerIn )
            this.log.canon.note ( this.logFormat (
                'set_pointer_in_CAUSAL_setSourcePointers',
                scriptToSet,
                timeStampBoxedPointerIn.time
            ) )

            //  Configure dependencies to track (this) dependent:

            let dependencyDatum = this.value[ sourceKey ]('datum')

            //  RECORD POINTERS OUT 

            if ( ! ( 'causal' in dependencyDatum.pointers.out ) ) {
                dependencyDatum.pointers.out.causal = []
            }

            //console.log (  scriptToSet.key )

            let pointerOut = new PointerOut ( scriptToSet.key )
            dependencyDatum
                .pointers.out.causal.push ( pointerOut )

            // LOGGING
            let timeStampBoxedPointerOut 
                = EventLog.timeStampBox ( pointerOut )
            dependencyDatum.log.setsPointerOut
                .note ( timeStampBoxedPointerOut )    
            this.log.canon.note ( this.logFormat (
                'set_pointer_out_CAUSAL_setSourcePointers',
                dependencyDatum,
                timeStampBoxedPointerOut.time
            ) )

            //dependencyDatum.log.sets.tasks  [   'reactiveDependentHandler:' 

            // When the dependency's value is set, the
            // dependency's EventLog->AsyncDispatcher should invalidate the
            // cache of the (this) dependent.
            

            // .cached and .reactive: FIXME - should use pointers instead?
            if ( scriptToSet.traits.cached ) {

                let cachedDependentHandlerKey 
                    = 'cachedDependentHandler:' + scriptToSet.key

                dependencyDatum.log.sets.tasks [ cachedDependentHandlerKey ]
                =   args => new Promise ( ( fulfill, reject ) => {
                        scriptToSet.stale = true
                        fulfill( cachedDependentHandlerKey )
                    } )
            }
            if ( scriptToSet.traits.reactive ) {
                
                let reactiveDependentHandlerKey 
                    = 'reactiveDependentHandler:' + scriptToSet.key

                dependencyDatum.log.sets.tasks [ reactiveDependentHandlerKey ]
                =   args => new Promise ( ( fulfill, reject ) => {
                        
                        //console.log( `scopedFunKeySnifferHandlerGet` )
                        
                        this.runScriptAndLog ( scriptToSet )
                        fulfill( reactiveDependentHandlerKey )
                    } )
            }
        },
        
        // vertexSet is using a keysniffer to get the keys of functions called in
        // Scripts, when the Script is set to the graph.
        //
        // If you're pushing data from your Fun, you'll trigger setters
        // on the other Datums-
        'setSinkPointer': ( scriptToSet, sinkKey ) => 
        {

            // Allow creation if: SOURCE not yet exists FIXME.
            // Note the asymmetry with ---HandlerGet

            if ( ! ( sinkKey in this.value ) ) {
                this.vertexSet ( sinkKey, undefined ) 
            } 

            //  Configure dependents to track (this) dependency:
            //  RECORD pointers IN, FROM script TO sink; pointer is located in SINK

            let dependentDatum = this.value[ sinkKey ]('datum')

            if ( ! ( 'causal' in dependentDatum.pointers.in ) ) {
                dependentDatum.pointers.in.causal = []
            }
            let pointerIn = new PointerIn ( scriptToSet.key )
            dependentDatum
                .pointers.in.causal.push ( pointerIn )

                //console.log (`graph.scopedFunKeySnifferHandlerSet/[n>1] : Fun
                //: keySnifferHandler.set: PointerIn-s inserted at:`, sinkKey )
            
            // LOGGING
            let timeStampBoxedPointerIn = EventLog.timeStampBox ( pointerIn )
            dependentDatum.log.setsPointerIn
                .note ( timeStampBoxedPointerIn )
            this.log.canon.note ( this.logFormat (
                'set_pointer_in_CAUSAL_setSinkPointers',
                dependentDatum,
                timeStampBoxedPointerIn.time
            ) )

            //  Configure (this) dependency to track dependents:
            //  RECORD pointers OUT, FROM script TO sink; pointer is located in SCRIPT

            if ( ! ( 'causal' in scriptToSet.pointers.out ) ) {
                scriptToSet.pointers.out.causal = []
            }
            let pointerOut = new PointerOut ( sinkKey )
            scriptToSet.pointers.out.causal.push ( pointerOut )

                //console.log (`graph.scopedFunKeySnifferHandlerSet/[n>1] : Fun
                //: keySnifferHandler.set: PointerOut-s inserted at:`, key )

            // LOGGING
            let timeStampBoxedPointerOut 
                = EventLog.timeStampBox ( pointerOut )
            scriptToSet.log.setsPointerOut.note ( timeStampBoxedPointerOut )    
            this.log.canon.note ( this.logFormat (
                'set_pointer_out_CAUSAL_setSinkPointers',
                scriptToSet,
                timeStampBoxedPointerOut.time
            ) )

            return true // FIXME: pointers unchecked?
        },

        sniffSourceKeys :  __lambda => 
        {
            
            let __keys = []

            // WARNING FIXME TO : 
            //
            // Symbol(Symbol.toPrimitive) is still popping up in error messages,
            // so we are not yet out of the woods on this.
            //
            let __sourceNthKeySniffer = new Proxy ( {}, {
                get : ( __targ, __prop, __rcvr ) => {

                    //console.log(`step2A`, __prop)                    
                    
                    //  Here: we need to deal with the
                    //  interpreter's calls to __rcvr[Symbol.toPrimitive(hint)]

                    if ( __prop == Symbol.toPrimitive ) {
                        return ()=> true 
                    }   // WARNING: kludge

                    // Step 2, Branch A
                    // (We found a depth>1 key, but we do not know if its
                    // subkeys will be read, or not.)

                    __keys[ __keys.length - 1 ].push ( __prop )
                    return __sourceNthKeySniffer
                
                    // Repeat Step 2. until there are no more keys.
                },
                set : ( __targ, __prop, __val, __rcvr ) => {

                    //console.log(`step2B`, __prop)                    
                    
                    // Step 2, Branch B
                    // We found a sink, so the entire key-chain does not
                    // terminate in a Datum which is a source. Discard it.

                    __keys.pop()
                    return true 
                }
            } )

            let __sourceFirstKeySniffer = new Proxy ( {}, {
                get : ( __targ, __prop, __rcvr ) => {

                    //console.log(`step1A`, __prop)                    
                    
                    //  Here: we need to deal with the
                    //  interpreter's calls to __rcvr[Symbol.toPrimitive(hint)]

                    if ( __prop == Symbol.toPrimitive ) {
                        return ()=> true 
                    }   // WARNING: kludge

                    //  Step 1, Branch A
                    //  (We found a depth=1 key, but we do not know if its
                    //  subkeys will be read, or not.)

                    let __keyGroup = [ __prop ]
                    __keys.push ( __keyGroup )
                    return __sourceNthKeySniffer
                    
                    //  Proceed to Step 2.
                },
                set : ( __targ, __prop, __val, __rcvr ) => {

                    //console.log(`step1B`, __prop)                    
                    
                    //  Step 1, Branch B
                    //  (We don't care about sinks.)

                    return true 
                }
            } )
            
            // Step 0. Initiate algorithm.
            __lambda( __sourceFirstKeySniffer )

            // Step 3. Reduce key chains to deep keeps
            let     __deepKeys = __keys.map ( group => group.join ( '.' ) )
            return  __deepKeys 
        },

        sniffSinkKeys :  __lambda => 
        {
            
            let __temp = []
            let __keys = []

            let __sinkNthKeySniffer = new Proxy ( {}, {
                get : ( __targ, __prop, __rcvr ) => {

                    //  Step 2, Branch A
                    //  (We found a depth>1 key, but we do not know if its
                    //  key-chain will terminate in a sink, or not.

                    __temp.push ( __prop )
                    return __sinkNthKeySniffer
                },
                set : ( __targ, __prop, __val, __rcvr ) => {

                    // Step 2, Branch B
                    // We found a sink, terminating the entire key-chain.

                    __temp.push ( __prop )
                    __keys.push ( __temp )
                    //  Discarding temp here is unnecessary as temp will
                    //  be discarded in sinkFirstKeySniffer.

                    return true 
                }
            } )

            let __sinkFirstKeySniffer = new Proxy ( {}, {
                get : ( __targ, __prop, __rcvr ) => {

                    //  Step 1, Branch A
                    //  Any previous source deep-keys which did not
                    //  teminate in a sink key, are discarded.

                    __temp = []

                    //  (We found a depth=1 key, but we do not know if its
                    //  key-chain will terminate in a sink, or not.

                    __temp.push ( __prop )
                    return __sinkNthKeySniffer
                },
                set : ( __targ, __prop, __val, __rcvr ) => {

                    //  Step 1, Branch B, task 1
                    //  Any previous source deep-keys which did not
                    //  teminate in a sink key, are discarded.
                    
                    __temp = []
                    
                    //  Step 1, Branch B, task 2
                    // (We found a depth=1 key.)

                    let __keyGroup = [ __prop ]
                    __keys.push ( __keyGroup )
                    return true 
                }
            } )

            // Step 0. Initiate algorithm.
//            __lambda ( __sinkFirstKeySniffer )

            // Step 3. Reduce key chains to deep keeps
            let     __deepKeys = __keys.map ( group => group.join ( '.' ) )
            return  __deepKeys 

            //console.error ( `sink`, sniffSinkKeys ( scriptToSet.lambda )  )
        }

    }   } // graph.handlers()

    ///////////////////////////////////////////////////////////////////////////
    //  
    //  This is recursively called by datumHandlerApply.
    //
    //  Operates on an instance of Datum, whose value has typeof 'object'
    // 
    //  Generally used to unflatten vertices from the graph index, before
    //  returning the unflatted object to the user.
    //
    //  Not efficient. A lot of room for optimisation. Will run 
    //
    //      for ( const key in  this.value ) wayyy too many times for each
    //      tree..? FIXME.
    //
    ///////////////////////////////////////////////////////////////////////////
      
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
            
            //  Any object that reaches here will be used as a target, to
            //  recover data stored in all vertices of the graph.
            //
            //  Similar to vertexSprout, except that it builds the data in an
            //  object to be ejected from the graph instead; whereas
            //  vertexSprout builds an injected object's data into the graph.
            //
            for ( const key in this.value ) {
                if ( ! key.includes ( '.' ) ) {
                    object[ key ] = this.value[ key ]()
                } 
            }
            return object
        }
    }
//*/    
}
