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
        this.dispatch () 
        this.actuallyNote ( preferATimeStampBoxedValue ) 
            //console.log ( this.book[ this.book.length -1 ] )
    }

    // (graph) is optional
    actuallyNote ( preferATimeStampBoxedValue ) {
        this.book.push( preferATimeStampBoxedValue )
    }

    async dispatch () {}
        // Interpreter should inline this out of existence unless
        // emit actually does something in a subclass

    static timeStampBox ( value ) {
        return [ performance.now(), value ]
    }
}

// DOM already has an EventTarget class.
class AsyncDispatcher extends EventLog {
    
    constructor () {

        super()
            //this.queue = []
            // .push() to add on the right
            // .shift() to remove on the left

//console.error (`WIP here - get reactive Funs running.`)

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
    async dispatch() {
        let resolvedPromises = await Promise.all (
            Object.values ( this.tasks ) .map ( t => t() )
        )
        this.actuallyNote ( EventLog.timeStampBox ( resolvedPromises ) ) 
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
            // In Fun, it is used to store the return value of Funs.
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

//  Generally, when defining an Fun:
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
//  -   "Proc"  "Procedure"
//  -   "Fun"  "Prog"  "Program"
//  -   "Sub"  "Routine"  "Subroutine"
//  -   Probably too conflicty: "Service" "Exec" 
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
//  - Op
//  - Fun
//  - Fun
//  - Lambda
//  - Anon
//
//  On one hand, Fun fits with the rule of naming brandy things with harsh
//  syllables. On the other, Lambda and Fun are much more specific about what we're
//  actually parking at those nodes. Anon is cute, but seems a bit distracting.
//  Will continue to ruminate on the shortlist for a bit.
//
//  ---
//  Someone suggested NoFun for optimal confusion. Another wanted CoLaDa.
//  I think we're down to a single-syllable shootout, sorted by minimalism:
//
//  - Op
//  - Fun (typing F is leftier)
//  - Lam (typing L is rightier)
//  - Fun (the only unabbreviated remainer)
//
////////////////////////////////////////////////////////////////////////////////
//
// args[0] must be function
// args[0] must be an object of traits
class Fun extends Datum {

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

//      // Here we've overriding Datum.log
//      Object.defineProperty ( this, 'log', {
//          configurable: true,
//          enumerable  : false,
//          value       : new AsyncDispatcher, 
//              //  EventLog.actuallyNote/1 stores [ performance.now(), value ],
//              //  so what should we pass as (value) ? Discussion:
//              //
//              //  [
//              //      delete: [ 'd', Datum ] 
//              //          ... Datum's own log should contain history of values
//              //
//              //      set:    [ 's', Datum ]
//              //          ... Datum's own log should contain history of values
//              //
//              //      get:    [ 'g', (gotten value), Datum ]
//              //          ... Datum's own log should contain history of values
//              //
//              //
//              //  ]

//          writable    : true
//      } )

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

    logFormat ( typeString, vertexObject, timeStamp ) {
        return  {
                    timeStamp   : timeStamp,
                    datum       : vertexObject,
                    type        : typeString
                }
    }

    runFunAndLog ( datum ) {
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
                'get_vertex_miss_runFunAndLog',
                datum,
                timeStampBoxedValue[0]
            ) )
        }

        else {
            // !stale && cached
        
            result = datum.value        
            // cache hit, scenario 1 of 3; an Fun

            datum.stale = false // for general coherence

            //  LOGGING - CACHE HIT - more scenarios in vertexGetTyped; more
                    // scenarios in graphHandlerApply, datumHandlerApply
            let timeStampBoxedValue = EventLog.timeStampBox ( result )
            datum.log.gets.hits.note ( timeStampBoxedValue )
            this.log.canon.note ( this.logFormat (
                'get_vertex_hit_runFunAndLog',
                datum,
                timeStampBoxedValue[0]
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
                timeStampBoxedValue[0]
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

        if ( datum instanceof Fun && datum.traits.getHandler ) { 
            return this.runFunAndLog ( datum ) 
        }

        else
        if ( typeof datum.value == 'object' ) { // ( 'function's are not sprouted )

            // Wherein. if we find that the user has previously set an
            // object as the value, we try to intercept the call to that
            // object's properties...

            //console.log (`graph.vertexGet/1 : found that datum.value is
            //an object, so will return graph.value ['${key}'] `)

            
                    result = this.value[ datum.key ]  
                    // cache hit, scenario 1 of 2; not an Fun, no cache 
        }                                           

        else {      result  =  datum.value      
                    // cache hit, scenario 2 of 2; not an Fun, no cache  
        }                                           

        // LOGGING - 2 cache hit scenarios in vertexGetTyped; more scenarios in 
        //              graphHandlerApply, datumHandlerApply, runFun

        //console.log(datum, this.value[key])
        let timeStampBoxedValue = EventLog.timeStampBox ( result )
        datum.log.gets.hits.note ( timeStampBoxedValue )
        this.log.canon.note ( this.logFormat (
            'get_vertex_hit_vertexGetTyped',
            datum,
            timeStampBoxedValue[0]
        ) )
        
        return result
    }    

    //  Deletes all child vertices.
    //  Prune is to Sprout, what Delete is to Update.
    vertexPrune ( key ) {

        for ( const loopKey in this.value ) {

            if ( loopKey.startsWith ( key + '.' ) ) {
                
                if ( ! this.vertexDelete ( loopKey ) ) { return false }
            }
        }
        return true
    }

    vertexSet ( ... args ) {

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

        // If datumToSet.value IS an Fun, call it on a keySniffer to plant pointers.
        if ( datumToSet.value instanceof Fun )
        {
                //console.log (`graph.vertexSet/[n>1] : value instanceof Fun `)

            // Assign all old Datum's own properties except (those listed below) to Fun.
            delete datumToSet.lambda
            delete datumToSet.value
            delete datumToSet.proxyTarget

            let funToSet 
                    =   Object.defineProperties ( 
                            valueToSet, 
                            Object.getOwnPropertyDescriptors ( datumToSet ) )
    
            let keySniffer = new Proxy ( {}, {

                get :   funToSet.traits.hasSources
                        ? this.handlers
                            .scopedFunKeySnifferHandlerGet ( funToSet )
                        : undefined,

                set : funToSet.traits.hasSinks
                        ? this.handlers
                            .scopedFunKeySnifferHandlerSet ( funToSet )
                        : undefined
            } )

                  //console.log (`graph.vertexSet/>1 : Fun : BEFORE
                  //funToSet.lambda(keySniffer), funToSet.lambda: `,
                  //funToSet.lambda,'traits:', funToSet.traits)
            
            // Detect dependencies and plant pointers.
            funToSet.lambda ( keySniffer )

                  //console.log (`graph.vertexSet/>1 : Fun : AFTER
                  //value.lambda(keySniffer)`, funToSet.traits )
                    //console.log ( funToSet.toString() )

            funToSet.stale = true
                // Fun will not run until the next get (no gets here)
                //
                // Whether Fun.traits.cached is true or not, the Fun.stale
                // property will be defined. Because it is defined for all
                // Datum, and Fun extends Datum.

            this.value [ keyToSet ]
                = new Proxy ( funToSet.proxyTarget, this.datumHandler )   

                //console.log(  `graph.vertexSet/[n>1], Fun, AFTER SET,
                //keyToSet:`, keyToSet, 
                //  'value which was set:', this.value [ keyToSet ]('datum'), 
                //  'success check components :', this.value [ keyToSet ]('datum'),'==', args[1] ,
                //  'result:', this.value [ keyToSet ]('datum') == args[1] )

            let result = this.value [ keyToSet ]('datum') == args[1] 
            
            //console.log (`graph.vertexSet/[n>1], Fun, result obtained: result`)
            //console.log (this.value [ keyToSet ]('datum').traits)

            if ( result ) {
            
                // LOGGING - 1 scenario (1 of 2 in vertexSet/n)
                let timeStampBoxedValue =  EventLog.timeStampBox ( { 
                    'Fun instance'  :   funToSet ,
                    'FIXME'         :   `Placeholder log format for Fun, because
                                         Fun.toString/n doesn't handle circular
                                         objects yet.`                
                } ) 
                datumToSet.log.sets.note ( timeStampBoxedValue )
                this.log.canon.note ( this.logFormat ( 
                    'set_vertex_Fun_vertexSet',
                    datumToSet,
                    timeStampBoxedValue[0]
                ) ) 
            }
            return result
        } 

        else 
        {  // If datumToSet.value is NOT an Fun, then complete the assignment.

            //console.log (`graph.vertexSet/[n>1] : value NOT instanceof Fun `)


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
                    timeStampBoxedValue[0]
                ) ) 
            } 
            return result

        } // End of block where: (value instanceof Fun) 

    }
  
    //  Updates all child vertices.
    //  Prune is to Sprout, what Delete is to Update.
    vertexSprout ( key, value ) {

        for ( const subKey in value ) {

            let compoundKey = key + '.' + subKey

            if ( ! this.vertexSet ( compoundKey, value[ subKey ] ) )       
            { return false }
        }
        return true
    }

    handlers () { return {
    'datumHandlerDeleteProperty': ( targ, prop ) => {
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
    'datumHandlerGet':  ( targ, prop, rcvr ) => {
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
    'datumHandlerSet' : ( targ, prop, val, rcvr) => {
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
    'datumHandlerApply' : ( targ, thisArg, args ) => { 
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
    'graphHandlerApply': ( targ, thisArg, args ) => { 
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

                    /*
                    case 'node' :
                        // Serl Node, TODO
                        break
                    */

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
                    case 'server' :
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

    // vertexSet is using a keysniffer to get the keys of functions called in
    // Funs, when the Fun is set to the graph.
    //
    // If you're pulling data into your Fun, you'll trigger getters
    // on the other Datums-
    'scopedFunKeySnifferHandlerGet': funToSet => {
        return ( ksTarg, ksProp, ksRcvr ) => {
          
                //console.log (`graph.scopedFunKeySnifferHandlerGet/[n>1] : Fun
                //: keySnifferHandler.get: `, ksProp)

//  Configure (this) dependent to track dependencies:

//  RECORD POINTERS IN

            if ( ! ( 'causal' in funToSet.pointers.in ) ) {
                funToSet.pointers.in.causal = []
            }
            let pointerIn = new PointerIn ( ksProp)
            funToSet.pointers.in.causal.push ( pointerIn )

            // LOGGING
            let timeStampBoxedPointerIn = EventLog.timeStampBox ( pointerIn )
            funToSet.log.setsPointerIn
                .note ( timeStampBoxedPointerIn )
            this.log.canon.note ( this.logFormat (
                'set_pointer_in_CAUSAL_scopedFunKeySnifferHandlerGet',
                funToSet,
                timeStampBoxedPointerIn[0]
            ) )

            // WARNING: does not require dependency keys to be in the graph
            // before dependents are set FIXME
            //
            //  Configure dependencies to track (this) dependent:
                   
            if ( ! ( ksProp in this.value ) ) {
                throw Error (`graph.vertexSet/n tried to set an Fun, but the
                        Fun referred to a source address which has not been
                        set: (${ ksProp })`)
            } // Note the asymmetry with ---HandlerSet

//  Configure dependencies to track (this) dependent:

            let dependencyDatum = this.value[ ksProp ]('datum')

//  RECORD POINTERS OUT 

                if ( ! ( 'causal' in dependencyDatum.pointers.out ) ) {
                    dependencyDatum.pointers.out.causal = []
                }

                    //console.log (  funToSet.key )

                let pointerOut = new PointerOut ( funToSet.key )
                dependencyDatum
                    .pointers.out.causal.push ( pointerOut )

                // LOGGING
                let timeStampBoxedPointerOut 
                    = EventLog.timeStampBox ( pointerOut )
                dependencyDatum.log.setsPointerOut
                    .note ( timeStampBoxedPointerOut )    
                this.log.canon.note ( this.logFormat (
                    'set_pointer_out_CAUSAL_scopedFunKeySnifferHandlerGet',
                    dependencyDatum,
                    timeStampBoxedPointerOut[0]
                ) )

                //dependencyDatum.log.sets.tasks  [   'reactiveDependentHandler:' 

                // When the dependency's value is set, the
                // dependency's EventLog->AsyncDispatcher should invalidate the
                // cache of the (this) dependent.
                

                // .cached and .reactive: FIXME - should use pointers instead?
                if ( funToSet.traits.cached ) {

                    let cachedDependentHandlerKey 
                        = 'cachedDependentHandler:' + funToSet.key

                    dependencyDatum.log.sets.tasks [ cachedDependentHandlerKey ]
                    =   args => new Promise ( ( fulfill, reject ) => {
                            funToSet.stale = true
                            fulfill( cachedDependentHandlerKey )
                        } )
                }
                if ( funToSet.traits.reactive ) {
                    
                    let reactiveDependentHandlerKey 
                        = 'reactiveDependentHandler:' + funToSet.key

                    dependencyDatum.log.sets.tasks [ reactiveDependentHandlerKey ]
                    =   args => new Promise ( ( fulfill, reject ) => {
                            
                            //console.log( `scopedFunKeySnifferHandlerGet` )
                            
                            this.runFunAndLog ( funToSet )
                            fulfill( reactiveDependentHandlerKey )
                        } )

                }

//console.error (`WIP here -  insert tasks to dependencies.`)

                    //console.log (`graph.scopedFunKeySnifferHandlerGet/>1 : Fun : keySnifferHandler.get: ended`)

        }
    },

    // vertexSet is using a keysniffer to get the keys of functions called in
    // Funs, when the Fun is set to the graph.
    //
    // If you're pushing data from your Fun, you'll trigger setters
    // on the other Datums-
    'scopedFunKeySnifferHandlerSet': funToSet => {
        return ( ksTarg, ksProp, ksVal, ksRcvr ) => {

                //console.log (`graph.scopedFunKeySnifferHandlerSet/[n>1] : Fun
                //: keySnifferHandler.set, ksProp:`, ksProp, 'ksVal:', ksVal )

//  Configure (this) dependency to track dependents:

//  RECORD POINTERS OUT

            if ( ! ( 'causal' in funToSet.pointers.out ) ) {
                funToSet.pointers.out.causal = []
            }
            let pointerOut = new PointerOut ( ksProp )
            funToSet.pointers.out.causal.push ( pointerOut )

                //console.log (`graph.scopedFunKeySnifferHandlerSet/[n>1] : Fun
                //: keySnifferHandler.set: PointerOut-s inserted at:`, key )

            // LOGGING
            let timeStampBoxedPointerOut 
                = EventLog.timeStampBox ( pointerOut )
            funToSet.log.setsPointerOut.note ( timeStampBoxedPointerOut )    
            this.log.canon.note ( this.logFormat (
                'set_pointer_out_CAUSAL_scopedFunKeySnifferHandlerSet',
                funToSet,
                timeStampBoxedPointerOut[0]
            ) )

//  Configure dependents to track (this) dependency:

//  RECORD POINTERS IN

            if ( ! ( ksProp in this.value ) ) {
                this.vertexSet ( ksProp, undefined ) 
            } // Note the asymmetry with ---HandlerGet

            let dependentDatum = this.value[ ksProp ]('datum')

            if ( ! ( 'causal' in dependentDatum.pointers.in ) ) {
                dependentDatum.pointers.in.causal = []
            }
            let pointerIn = new PointerIn ( funToSet.key )
            dependentDatum
                .pointers.in.causal.push ( pointerIn )

                //console.log (`graph.scopedFunKeySnifferHandlerSet/[n>1] : Fun
                //: keySnifferHandler.set: PointerIn-s inserted at:`, ksProp )
            
            // LOGGING
            let timeStampBoxedPointerIn = EventLog.timeStampBox ( pointerIn )
            dependentDatum.log.setsPointerIn
                .note ( timeStampBoxedPointerIn )
            this.log.canon.note ( this.logFormat (
                'set_pointer_in_CAUSAL_scopedFunKeySnifferHandlerSet',
                dependentDatum,
                timeStampBoxedPointerIn[0]
            ) )

            return true // FIXME: pointers unchecked?
        }
    }

    //  keys : values 
    //                  end here

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
}

globalThis.Fun     = Fun
globalThis.Datum    = Datum
globalThis.Graph    = Graph 
