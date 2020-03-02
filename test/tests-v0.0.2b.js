import * as Serl from   '../lib/serl.js'
import * as SSON from   '../lib/sson/sson.js'
import * as Exam from '../lib/classes/exam.js'

new Exam.Exam ( { 
    config : {
        expand : {
            initial_context : true,
            tests : {
                legibility : true,
            }
        }
    },
    concerns : [ 
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
{   warning: `Perhaps a lot of props of values in the graph should be inenumerable. However, until we write a utlity function to recursively list all enumerables up the prototype chain, we can develop using enumerable properties except when fundamentally dysfunctional.`
},
{   test : `Build a reactive datastore, where each datum is represented by a Proc instance.`,
    code : function () {

/*******************************************************************************
 *
 *  Abstract Data [ Model @ Graph ]
 *
 *  -   [ Entities @ Addresses @ Predicates ] which are spatio-temporally Discrete
 *
 *      1.  [ Data @ Values ] as [ Nodes @ Vertices ]
 *
 *      2.  [ Dependencies @ Causalities ] 
 *              as [ Arrows @ Directed Edges] between Datum
 *
 *          -   The following expressions are (roughly) equivalent:
 *
 *              -   'Y depends on X' 
 *              -   'X determines Y' 
 *              -   'X supervenes on Y' 
 *              -   'there is an arrow from X to Y' 
 *              -   'changes in X, cause changes in Y' 
 *              -
 *              -   'there is a causal function, F, from X to Y'
 *                      (X is its domain, and Y its codomain)
 *
 *              -   'changes in X, imply changes in Y'
 *              -   'a change in X, necessitates an update of Y'
 *                      (this update may, or may not, 
 *                       result in the same value of Y)
 *
 *          -   The following expressions are (roughly) equivalent:
 *
 *              -   'A is equivalent to B' 
 *              -   'there is a two-way dependency, between A and B'
 *              -   'there are two opposing arrows, between A and B'
 *              -   'a change in A necessites an update of B, and, 
 *                      a change in B necessitates an update of A'
 *
 *  -   Existential Quantification of a Discrete Entity.
 *
 *      1.  [ Creation @ Existentialisation ]
 *
 *      2.  [ Deletion @ Uncreation @ Destruction]
 *
 *  -   [ Qualifying @ Copying ] Operations may be performed,
 *          only between two Entities which Exist
 *
 *      3a. [ Reading @ Evaluation @ Getting ] is a copying of values,
 *              from a remote Address (typically a Machine), 
 *              to a local Address (typically a User).
 *
 *      3b. [ Updating @ Writing @ Setting @ Modifying ] is a copying of values,
 *              from a local Address (typically a User),
 *              to a remote Address (typically a Machine).
 *
 *  -   The acronym, CRUD ( Create, Read, Update, Delete), is conventional.
 *  
 *  -   (Discuss) Reading and Updating are basically the same operation, but in
 *      different directions. The main difference is that because the flow
 *      teleology is User-centric (describes User intent), there arises an
 *      asymmetry between Reading and Updating, whereby 
 *
 *      -   Reading ASSUMES the staleness of the User's data, and therefore
 *          performs dependency check and reevaluation, of the remote data,
 *          whereas,
 *
 *      -   Updating ASSUMES the staleness of the remote data, and therefore
 *          performs no dependency check and reevaluation of the local data,
 *
 *  -   (Discuss) Creating may be viewed simply as the first Update event. 
 *
 *  -   (Sketch) Given two types of Entity, and three types of event, we should need
 *      six ( 6 = 2 * 3 ) blocks of code to implement this model.
 *      Additionally, we have to pipe the Qualifying Operation to two sets
 *      of syntax, respectively for 3a. and 3b.
 *
 ******************************************************************************/


        let n1 = new Serl.Node('Node 1')
        //let p1 = n1.spawn()
        //let p2 = n2.spawn()
        //console.log ( n1 )

        let graph = {
            vertices : {}  // consider upgrade to WeakMap (TODO)
        }

    /////////////////////////////////////////////////////////////////
    //
    //      1.  Approach using 'a prop key' as the datum key, then defining
    //          properties on the value.
    //    
    //          This however, requires that we coerce all primitives 'string's,
    //          'boolean's, and 'number's to objects.  This would result in
    //          large performance losses under the hood, and users may not know
    //          why their data operations are so non-performant.
    //          
    //          But it completely fails for 'undefined' and 'null'. So we cannot
    //         
    //  Object.defineProperty ( graph.vertices, 'a prop key', {
    //      value       : new String ('a prop value'),
    //                              // specification default : undefined
    //      configurable: false,    // specification default : false    
    //      enumerable  : false,    // specification default : false    
    //      writable    : true      // specification default : false     
    //  } )
    //  Object.defineProperty ( graph.vertices['a prop key'], 'a meta prop key', {
    //      value       : 'a meta prop value',
    //      configurable: false,    
    //      enumerable  : false,    
    //      writable    : true      
    //  } )
    //
    //  console.log ( graph.vertices['a prop key'] ) 
    //
    /////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////
    //
    //      2.  Approach with an extra layer of indirection. 'a prop key' now
    //          refers to an object. The value of 'a prop key' is stored in a
    //          subprop called 'datum' because we don't want to be confusing
    //          and name the prop 'value'. We might alternatively call it 'real
    //          value', 'really', or 'actually'...
    //
    //          graph.vertices.datum

        graph.vertices['a prop key'] = {}

        Object.defineProperty ( graph.vertices['a prop key'], 'datum', {
            configurable: false,    // specification default : false    
            enumerable  : true,     // specification default : false    
            writable    : true,     // specification default : false     
            value       : 'a prop value',
                                    // specification default : undefined
        } )

    //      2.1.    As this seems to be satisfactory so far, we proceed to add a
    //          log to this vertice. Upon its creation, a vertice can log its
    //          first update. Upon deletion, a vertice can log a soft-delete
    //          date.
    //              
    //          As this seems to be satisfactory so far, we proceed to a cache
    //          to this vertice. The cache has a log, enabling playback of a
    //          datum's history - if logging is enabled, this might eat up
    //          memory very quickly with frequently modified datum, such as UI
    //          data.
    //
    //          graph.vertices.datum.log

        Object.defineProperty ( graph.vertices['a prop key'], 'log', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : {            // Examples of data structure:
                reads   : [ new Date ],       
                updates : [ [ new Date, 'the relevant prop value'] ],       
                deletes : [ [ new Date, 'the relevant prop value'] ]        
            },
        } )

    //      2.2.    Assuming that all is well with the first two props, we now
    //          can consider adding a cache. But since the 'datum's have not
    //          been described to hold computed values, the computation time of
    //          any datum should be 0, and so a cache would be pointles. First
    //          we should add computability of values.
    //
    //          graph.vertices.datum.algo

        Object.defineProperty ( graph.vertices['a prop key'], 'algo', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : () => 1 + 2   // some kind of function
        } )

    //      2.3.    This suffices for computations which do not depend on other
    //          data. In order to point to other data in the graph, we need to
    //          start storing arrows between vertices. For starters, we'll only
    //          store the 'in arrows' because we want to know what data are used
    //          in the computation of this datum. But later we may want to
    //          automatically 'push' updates to any data whose computations
    //          depend on this datum, so we will have to store the 'out arrows'
    //          also.
        
        Object.defineProperty ( graph.vertices['a prop key'], 'arrows', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : {
                ins  : [ 'another prop key' ],
                outs : [ 'yet another prop key' ]
            } 
        } )

    //      2.4.    Now that we can traverse vertices via arrows, it is
    //          reasonable to believe that some value computations will be
    //          expensive, and so we may want to have a cache boolean, which 
    //          allows stale values to be marked, without recomputing them
    //          immediately.
        
        Object.defineProperty ( graph.vertices['a prop key'], 'cache', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : {        // Examples of data structure:
                stale   : false,
                hits    : [ new Date ],
                misses  : [ new Date ]
            } 
        } )

        console.log ( JSON.stringify ( graph, SSON.replacer, 4 ) )

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
















