import * as Corner from '../corner.js'
import * as Exam from '../lib/submodules/exam.js/exam.js'
//import * as Serl from   '../lib/serl.js'
//import * as SSON from   '../lib/sson/sson.js'

// D3 visualisation experiment:
function graphViewer ( graphServer ) {

    d3.namespaces.corner = '127.0.0.1'

    let 

    forceNodeData   = [],
    forceLinkData   = [],
    width       = 500,
    height      = 500,

    color   = d3.scaleOrdinal(d3.schemeCategory10),

    //  HENCEFORTH, the syntax 
    //
    //      X_Y
    //
    //  ... shall refer to SELECTIONS, where ...
    //
    //      X refers to a GROUP, and
    //      Y refers to ELEMENTS, in that group.
    //
    //  It is MANDATORY to brain d3's documentation on the differences between
    //  what is returned by (d3.select / d3.selectAll) and what is returned by
    //  (SELECTION.select / SELECTION.selectALL), before proceeding.


    body_svg
    = d3.select ( 'body' )
        .append ( 'svg' )
        .attr ( 'width', width )
        .attr ( 'height', height )
        .attr ( 'stroke-width', 3 )
        .attr ( 'style',   `background-color: #eeeeee;
                            font-family: Roboto, Helvetica, sans-serif;
                            font-weight: 300;
                            font-size: 16px;`
        ),

    svg_positionerG 
    = body_svg
        .append ( 'g' )
        .attr ('corner:GraphViewerRole','positioner'),
               
    positionerG_manyNodesG
    = svg_positionerG
        .append ( 'g' )
        .attr ('corner:GraphViewerRole','nodeGroups'),

        manyNodesG_oneNodeG    
        = positionerG_manyNodesG
            .selectAll (),
    
        //  The SELECTION (manyNodesG_oneNodeG)'s FIRST reference.
        //  This has one group for each <g>1 in svg_positionerG;
        //  groups will be empty as <g>2s have not been appended.

    positionerG_manyLinksG
    = svg_positionerG
        .append ( 'g' )
        .attr ('corner:GraphViewerRole','linkGroups'),

        manyLinksG_oneLinkG    
        = positionerG_manyLinksG
            .selectAll (),
    
        //  The SELECTION (manyLinksG_oneLinkG)'s FIRST reference.
        //  This has one group for each <g>1 in svg_positionerG;
        //  groups will be empty as <g>2s have not been appended.

    tickHandler
    = function () {
        manyNodesG_oneNodeG.attr ( 'transform', d => `translate ( ${d.x}, ${d.y} )` )
        manyLinksG_oneLinkG
            .attr   ( 'd', d => { 
                                console.log (d) 
                                return `M ${ d.source.x }, ${ d.source.y } 
                                        T ${ d.target.x }, ${ d.target.y }`
                                } )
    },

    forceLink 
    = d3.forceLink ( forceLinkData )
        .id ( d => d.key ),

    simulation 
    = d3.forceSimulation ( forceNodeData )

        .force ( '?charge',     d3.forceManyBody () )
        .force ( '?x',          d3.forceX () )
        .force ( '?y',          d3.forceY () )
        .force ( '?collision',  d3.forceCollide (70) )
        .force ( '?links',      forceLink )

        .velocityDecay  ( 0.7 )
        .alphaTarget    ( 0.0001 )
        .alphaDecay     ( 0.01 ) 

        .on ( 'tick', tickHandler ),
                                                                  
    updateSimulation 
    = function ( latest ) 
    {
        // Ensure that SIMULATION knows (NODE Ontology),
        //                              (LINK Ontology).

console.log ( latest )
try {
        simulation  .nodes ( latest.forceNodeData ) 
//        forceLink   .links ( latest.forceLinkData ) 
} catch ( e) {
    console.error (e, latest)
}


        // Ensure that (element ontology) has a 1-1 mapping to (NODE Ontology)

        manyNodesG_oneNodeG   // The SELECTION (manyNodesG_oneNodeG)'s SECOND reference. 
        = manyNodesG_oneNodeG

            .data ( latest.forceNodeData , d => d.key  )
                
                //  This DATA GROUP is then JOINED to ELEMENT GROUP,
                //  manyNodesG[GraphViewerRole=nodeGroups], 
                //  in the SELECTION (manyNodesG_oneNodeG).

            .join 
            (
                enterer =>
                {
                        // Each (enterer) is a datum in the
                        // group,manyNodesG[GraphViewerRole=nodeGroups], which
                        // isn't already mapped to a oneNodeG element.

                    let oneNodeG = enterer
                        .append ( 'g' )

                    let circle = oneNodeG
                        .append ( 'circle' )
                            .attr ( 'r', 12 )
                            .attr ( 'fill', 
                                    d =>    d.lambda 
                                            ? ( d.stale ? '#550' : '#ee0' )
                                            : '#6af'
                            )
                            .attr ( 'stroke', 
                                    d => d.lambda ? '#000' : '#fff' 
                            )

                    let foreignObject = oneNodeG
                        .append( 'foreignObject' )
                            .attr( 'x', '5')
                            .attr( 'y', '5')
                            .attr( 'height', '500')
                            .attr( 'width', '100')

                    let div = foreignObject
                        .append( 'xhtml:div' )
                            .attr( 'style',    
                                   `padding: 5px;
                                    overflow-wrap: break-word; 
                                    border: 1px solid #999;
                                    border-radius: 5px;
                                    background-color: rgba(255,255,255,0.7);
                                    ` 
                            )
                            .text ( d => d.key + ' : ' + d.value )
  
                    return oneNodeG 
                },
                updater => 
                {
                    let circle = updater
                        .select ( 'circle' )
                        .transition()
                        .duration ( 700 ) 
                            .attr ( 'fill', d =>    d.hit 
                                                    ?   '#6d8' 
                                                    :   d.lambda
                                                        ?   '#ee0'
                                                        :   '#6af' )
                        .transition()
                            .attr ( 'fill', d =>    d.lambda
                                                    ?   '#ee0'
                                                    :   '#6af' )
                    let div = updater 
                        .select( 'div' )
                            .text ( d => d.key + ' : ' + d.value )

                    // This feels expensive; find a cheaper way later. FIXME
                    return updater
                },
                exiter => 
                { 
                    let circle = exiter
                        .select ( 'circle' )
                        .transition ()
                        .ease ( d3.easeCubicOut )

                            .transition () 
                                .attr ( 'fill', 'black' )
                                .attr ('r', 20 )
                    
                    exiter
                        .transition().delay ( 1000 ) 
                        .transition().duration ( 3000 ) 
                            .ease ( d3.easeCubicOut )
                            .style ( 'opacity', 0 )
                            .remove()
                    
                }

            )

        // Ensure that (element ontology) has a 1-1 mapping to (LINK Ontology)

        manyLinksG_oneLinkG   // The SELECTION (manyLinksG_oneLinkG)'s SECOND reference. 
        = manyLinksG_oneLinkG

            .data ( latest.forceLinkData )
                
                //  This DATA GROUP is then JOINED to ELEMENT GROUP,
                //  manyLinksG[GraphViewerRole=linkGroups], 
                //  in the SELECTION (manyLinksG_oneLinkG).

            .join 
            (
                enterer =>
                {
                        // Each (enterer) is a datum in the
                        // group,manyNodesG[GraphViewerRole=nodeGroups], which
                        // isn't already mapped to a oneLinkG element.

                    let oneLinkG = enterer
                        .append ( 'g' )

                    let path = oneLinkG 
                        .append ( 'path' )
                            .attr ( 'd', d => {
                                    //console.log ( p ( d ) )
                                    return `M ${ d.source.x }, ${ d.source.y } 
                                            T ${ d.target.x }, ${ d.target.y }`
                                  } )
                            .attr ( 'stroke', '#000' )
                            .attr ( 'stroke-width', '1' )
                            .attr ( 'fill', 'none' )

                }
            )

        simulation  .alpha (1).restart()
    },

    startSimulation  = server => 
    {
        
        let graph       = server ( 'graph' )

        graph.log.canon.tasks.graphViewer 
        = boxedValue => new Promise ( ( F, R ) => {

            // Not all cases of the switch require this; separate. FIXME

            let index = forceNodeData.findIndex ( 
                e => e.key == boxedValue.datum.key
            )

            if ( ~index ) { // Found an index; remove ephemeral signals.
                delete forceNodeData[ index ].hit
                delete forceNodeData[ index ].miss
            }

            let forceNodeDatum = {
                key     : boxedValue.datum.key,
                value   : boxedValue.datum.value,
                lambda  : boxedValue.datum.lambda ,
                    // This should destructively update the .lambda
                    // field if .lambda no longer exists here.
                stale   : boxedValue.datum.stale
            }
            let pushNodeButPreferUpdate = ( __index, __nodeDatum) => {
                if ( ~__index ) { // Found an index; replace element.
                    forceNodeData[ index ]  = __nodeDatum
                }
                else {          // Found no index; add element.
                    forceNodeData.push ( __nodeDatum )
                }
            }

            let sourceKey 
            let sinkKey
            let pushLink = ( __sourceKey, __sinkKey) => {
                forceLinkData.push ( {
                    source  : __sourceKey, 
                    target  : __sinkKey,
                    type    : 'causal'
                } ) 
            }
            
            let pushLastLinkIn = () => {

                sourceKey   = boxedValue.datum.pointers.in.causal[
                        boxedValue.datum.pointers.in.causal.length - 1
                    ].ikey
                sinkKey     = boxedValue.datum.key
                pushLink ( sourceKey, sinkKey )
            }
            let pushLastLinkOut = () => {

                sourceKey   = boxedValue.datum.key
                sinkKey     = boxedValue.datum.pointers.out.causal[
                        boxedValue.datum.pointers.out.causal.length - 1
                    ].okey
                pushLink ( sourceKey, sinkKey )
            }

            switch ( boxedValue.type ) {
                
                case 'delete_vertex_vertexDelete' :
                    console.log ( `DELETE` )
                    forceNodeData = forceNodeData.filter (
                        vertex => vertex.key != boxedValue.datum.key
                    )
                    break

                case 'get_vertex_hit_vertexGetTyped' :
                    console.log ( `GET, HIT` )
                    if ( ~index ) { // Found an index; report.
                        forceNodeData[ index ].hit = true
                    }
                    else {          // Found no index; complain.
                        R (`d3 visualiser (get_vertex_hit_vertexGetTyped) :
                            forceNodeData has no node with the key : 
                            ${ boxedValue.datum.key }` )
                    }
                    break

                case 'get_vertex_miss_runFunAndLog' :
                    console.log ( `GET, MISS` )
                    if ( ~index ) { // Found an index; report.
                        forceNodeData[ index ].miss = true
                        forceNodeData[ index ].value = boxedValue.datum.value
                    }
                    else {          // Found no index; complain.
                        R (`d3 visualiser (get_vertex_miss_runFunAndLog) :
                            forceNodeData has no node with the key : 
                            ${ boxedValue.datum.key }` )
                    }
                    break

                case 'set_vertex_vertexSet' :
                    console.log ( `SET,NOT FUN` )
                    pushNodeButPreferUpdate ( index, forceNodeDatum)
                    break

                case 'set_vertex_Fun_vertexSet' :
                    console.log ( `SET,FUN` )
                    pushNodeButPreferUpdate ( index, forceNodeDatum)
                    break

                case 'set_pointer_in_CAUSAL_scopedFunKeySnifferHandlerSet' :
                    
                    // FIXME : may result in pointer salad as this
                    //  is resolved asynchronously
                    
                    console.log ( `IN,SET` )
                    pushNodeButPreferUpdate ( index, forceNodeDatum)
                    pushLastLinkIn ()
                    break

                case 'set_pointer_in_CAUSAL_scopedFunKeySnifferHandlerGet' :
                    
                    // FIXME : may result in pointer salad as this
                    //  is resolved asynchronously
                    
                    console.log ( `IN,GET` )
                    pushNodeButPreferUpdate ( index, forceNodeDatum)
                    pushLastLinkIn ()
                    break

  
                case 'set_pointer_out_CAUSAL_scopedFunKeySnifferHandlerSet' :
                    
                    // FIXME : may result in pointer salad as this
                    //  is resolved asynchronously
                    
                    console.log ( `OUT,SET` )
                    pushNodeButPreferUpdate ( index, forceNodeDatum)
                    pushLastLinkOut ()
                    
                        // If sink-Datum did not previously exist, then we need to
                        // insert a placeholder node into the forceSimulation

                      //let placeholderIndex = forceNodeData.findIndex ( 
                      //    e => e.key == sinkKey 
                      //)
                      //if ( ! ( ~ placeholderIndex ) ) { 
                      //    
                      //    // Index not found. 
                      //    
                      //    forceNodeData.push ( { key: sinkKey } ) 
                      //}
                    break

                case 'set_pointer_out_CAUSAL_scopedFunKeySnifferHandlerGet' :
                    
                    // FIXME : may result in pointer salad as this
                    //  is resolved asynchronously
                    
                    console.log ( `OUT,GET` )
                    pushNodeButPreferUpdate ()
                    pushLastLinkOut ()
                    break
  
             default:
                R ( `d3 visualiser : unknown (log) boxedValue.type: ${boxedValue.type}` )
            }

//console.log ( 
//  p ( forceLinkData ),
//  boxedValue
//)
            updateSimulation    ( { forceNodeData: forceNodeData,
                                    forceLinkData: forceLinkData
                                } ) 
            F ( 'd3 visualiser, updated' )
        } )
    },

    zoom =
        d3
        .zoom()
        .scaleExtent([.1, 4])
        .on( "zoom", () =>  svg_positionerG
                            .transition ()
                            .duration ( 200 )
                            .ease ( d3.easeCubicOut ) 
                            .attr ( "transform", d3.event.transform ) 
        )

    // end of (let)s - continue imperatives:

    zoom ( body_svg )
    zoom.translateBy (  body_svg
                            .transition ()
                            .duration ( 400 )
                            .ease ( d3.easeCubicOut ), 
                        width / 2, 
                        height / 2 
    )

    startSimulation ( graphServer )

    return {
        simulation  : simulation,
        update      : updateSimulation,
        nodeData    : forceNodeData,
        linkData    : forceLinkData
    }
}

let p = thing => JSON.stringify ( thing, null, 4 )

new Exam.Exam ( { 
    config : {
        expand : {
          initialContext : true,
          //tests : {
          //    legible : true,
          //    verifiable : true
          //},
          //unexpectedFun : false
        }
    },
    concerns : [ 
/*
{   test : `Graph class constructor can return a graph server.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        //console.log( SERVER )
        //console.log( SERVER ( 'graph' ) )
        return {    graphInstance   : SERVER ( 'graph' ),
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
        SERVER.location = 'France'
        //console.log (SERVER( 'graph' ).value.location( 'datum' ).value)
        return  JSON.stringify ( [   SERVER.location = 'Malaysia' ,
                    SERVER( 'graph' ).value.location( 'datum' ).value
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
            aDatum  : SERVER.tree( 'datum' ) instanceof Datum,
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
{   test : `Computed properties; dependency getter / puller.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        //console.log (`Before setting SERVER.computed2a`)

        SERVER.computed2a       = new Fun ( s => s.source1 + s.source2 )
        
        //console.log (`After setting SERVER.computed2a`)

        //console.log (SERVER.computed2a)

        return JSON.stringify ( {
            computedValue   :   SERVER.computed2a,
        } )
    },
    want : JSON.stringify ( {
        computedValue   :   'theFIRSTpart;theSECONDpart;'
    } )
},
{   test : `Computed properties; dependency getter / puller - also check pointers on dependents and dependencies.`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed2a       = new Fun ( s => s.source1 + s.source2 )

        //console.log(`Before getting pointers.`)

        //console.log(SERVER( 'datum' ).value.computed2a( 'datum' ).pointers.in.causal[0].ikey
        //)

        let computed2apointers    = [
            SERVER( 'datum' ).value.computed2a( 'datum' ).pointers.in.causal[0].ikey,
            SERVER( 'datum' ).value.computed2a( 'datum' ).pointers.in.causal[1].ikey 
        ]
          //console.log(`After getting pointers.`)

          //console.log (SERVER( 'datum' ).value
          //                            .source1( 'datum' )
          //                            .pointers.out.causal[0].okey
          //)

        return JSON.stringify ( {
            computedValue   :   SERVER.computed2a,
            computed2apointers:   computed2apointers,
            source1Pointer    :   SERVER( 'datum' ).value
                                    .source1( 'datum' )
                                    .pointers.out.causal[0].okey,
            source2Pointer    :   SERVER( 'vertices' )
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
        let SERVER = new Graph ( 'server' )
        //SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed2a       = new Fun ( s => s.source1 + s.source2 )
    },
    expectError: true
},
{   test : `Computed properties; dependent setter / pusher : 
- pushed computation should not be written until the the Fun is run; 
- the Fun is run when the Fun's Datum is read (gotten/get);`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed3 = new Fun ( s => { 

            // pull
            let computed = s.source1 + s.source2
            
            //console.log (`IN Fun: BEFORE PUSH`) 

            // push
            s.sink4 = `Yo mama, I got two parts : ${computed}`
            
            //console.log (`IN Fun: AFTER PUSH`) 

            return computed
        } ) 
        
        //console.log( SERVER( 'vertices' ).sink4( 'unproxy' ).pointers.in )

        return JSON.stringify ( {
            sink4Before     : SERVER.sink4,
            computed3       : SERVER.computed3,
            sink4After      : SERVER.sink4,
        } )
    },
    want : JSON.stringify ( {
        sink4Before         : undefined,
        computed3           : `theFIRSTpart;theSECONDpart;`,
        sink4After          : `Yo mama, I got two parts : theFIRSTpart;theSECONDpart;`,
    } )
},
{   test : `Computed properties; dependent setter / pusher : 
- pushed computation should not be written until the the Fun is run; 
- the Fun is run when the Fun's Datum is read (gotten/get); 
- also check pointers on dependents and dependencies`, 
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.source1 = 'theFIRSTpart;' 
        SERVER.source2 = 'theSECONDpart;' 

        SERVER.computed3 = new Fun ( s => { 

            // pull
            let computed = s.source1 + s.source2
            
            //console.log (`IN Fun: BEFORE PUSH`) 

            // push
            s.sink4 = `Yo mama, I got two parts : ${computed}`
            
            //console.log (`IN Fun: AFTER PUSH`) 

            return computed
        } ) 
        
        //console.log( SERVER( 'vertices' ).sink4( 'unproxy' ).pointers.in )
        //console.log( SERVER( 'graph').log.canon.book )
        //console.log( JSON.stringify ( SERVER( 'graph').log.canon.book, null, 4 ) )

        return JSON.stringify ( {
            sink4Before     : SERVER.sink4,
            computed3       : SERVER.computed3,
            sink4After      : SERVER.sink4,
            computed3pointers :   [   SERVER( 'datum' ).value
                                        .computed3( 'datum' ).pointers.in.causal[0].ikey,
                                    SERVER( 'datum' ).value
                                        .computed3( 'datum' ).pointers.in.causal[1].ikey 
            ],
            source1Pointer    :   SERVER( 'datum' ).value
                                    .source1( 'datum' )
                                    .pointers.out.causal[0].okey,
            source2Pointer    :   SERVER( 'vertices' )
                                    .source2( 'datum' )
                                    .pointers.out.causal[0].okey,
            sink4Pointer      :   SERVER( 'vertices' )
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

        let g = new Graph( 'server' )
        let h = new Graph( 'server' )

    //console.warn ( 'Prepare DATUM', g.a = {}, g.a.i = 4, g.a.j = 5, g)
    //console.warn ( 'Apply DATUM', g.a() )
    //
    //console.warn ( 'Prepare SERVER', h.i = 4, h.j = 5, h)
    //console.warn ( 'Apply SERVER', h())

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
{   test : `Sourcing subkeys in Funs`,
    code : function () {

        let g = new Graph( 'server' )
        g.h = new Fun ( e => e.h.i + e.h.j )

        return JSON.stringify( g() ) 
    },
    expectError : true
},
{   test : `Tree insertion should handle Funs smoothly; Funs should be handled
smoothly by tree extraction; caching works? Lazy reads?`,
    code : function () {

        let G = new Graph( 'server' )

        G.a = 1
        G.b = 2

        G.m = new Fun ( e => e.a + e.b )
        G.n = { o: new Fun ( e => e.a + e.b ) }

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
{   test : `Fun.trait: getHandler`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.a = 1

        SERVER.b = new Fun ( s => ( s.a + 1 ) )
        //console.warn (SERVER.b)

        SERVER.c = new Fun ( s => ( s.a + 1 ), { getHandler: false } )
        //console.warn (SERVER.c)

        return JSON.stringify ( [ SERVER.b, SERVER.c ] )
    },
    want : JSON.stringify ( [ 2, undefined ] ) 
},
{   test : `Fun.trait: cached - do getters check staleness?`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.a = 1

        SERVER.b = new Fun ( s => ( s.a + 1 ) )
        SERVER( 'vertices' ).b( 'datum' ).stale = false

      //console.warn (SERVER( 'vertices' ).b( 'datum' ).stale)
      //console.warn (SERVER( 'vertices' ).b( 'datum' ).value)
      //console.warn (SERVER( 'vertices' ).b( 'datum' ).lambda)
      //console.warn (SERVER( 'vertices' ).b( 'datum' ).traits.cached)
      //console.warn (SERVER.b)
      //console.warn (SERVER( 'vertices' ).b( 'datum' ).stale)
      //console.warn (SERVER( 'vertices' ).b( 'datum' ).value)

        SERVER.c = new Fun ( s => ( s.a + 1 ), { cached : false } )
        SERVER( 'vertices' ).c( 'datum' ).stale = false
      
      //console.warn (SERVER( 'vertices' ).c( 'datum' ).stale)
      //console.warn (SERVER( 'vertices' ).c( 'datum' ).value)
      //console.warn (SERVER( 'vertices' ).c( 'datum' ).lambda)
      //console.warn (SERVER( 'vertices' ).c( 'datum' ).traits.cached)
      //console.warn (SERVER.c)
      //console.warn (SERVER( 'vertices' ).b( 'datum' ).stale)
      //console.warn (SERVER( 'vertices' ).c( 'datum' ).value)

        let datumB = SERVER( 'vertices' ).b( 'datum' )
        let datumC = SERVER( 'vertices' ).c( 'datum' )

        return JSON.stringify ( {
            defaultCachedStaleFlagBefore    : datumB.stale  == false,
            defaultCachedValueBefore        : datumB.value  == undefined,

                defaultCachedGetResult          : SERVER.b      == undefined,
                defaultCachedStaleFlagAfter     : datumB.stale  == false,
                defaultCachedValueAfter         : datumB.value  == undefined,

            notCachedStaleFlagBefore    : datumC.stale  == false,
            notCachedValueBefore        : datumC.value  == undefined,

                notCachedGetResult          : SERVER.c      == 2,
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
{   test : `Fun.trait: cached - do sources invalidate dependent caches via
stale flag?`,
    code : function () {
        let SERVER = new Graph ( 'server' )

        SERVER.a = 1
        SERVER.b = new Fun (  s => s.a + 2 )

        let vertices = SERVER( 'vertices' )
        let b = vertices.b( 'datum' )


      //console.warn ( b.stale, b.value, b.pointers, b.lambda )
      //console.warn ( SERVER.b )
      //console.warn ( b.stale, b.value, b.pointers, b.lambda )
    
        return JSON.stringify ( 
            [ b.stale, b.value, SERVER.b, b.stale, b.value ]
        )
    },
    want : JSON.stringify ( [ true, undefined, 3, false, 3 ] )
},
{   test : `Fun.trait: hasSinks`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        SERVER.a1 = new Fun (  s => { s.a2 = 2; return true } )
        SERVER.b1 = new Fun (  s => { s.b2 = 2; return true }, 
                                { hasSinks: false } )

        //console.log ( SERVER.a1, SERVER.a2 )
        //console.log ( SERVER.b1, SERVER.b2 )
        //console.log ( SERVER( 'vertices' ) )
    
        return JSON.stringify ( 
            [ SERVER.a1, SERVER.a2, SERVER.b1, SERVER.b2 ]
        )
    },
    want : JSON.stringify ( [ true, 2, true, undefined ] )
},

{   test : `Fun.trait: hasSources`,
    code : function () {
        let SERVER = new Graph ( 'server' )

        SERVER.a = 1
        SERVER.b = new Fun (  s => s.a + 2 )

      //console.warn ( SERVER.b )
      //console.warn ( SERVER.c )
      //console.log ( SERVER( 'vertices' ) )
    
        return JSON.stringify ( 
            [ SERVER.b, SERVER.c ]
        )
    },
    want : JSON.stringify ( [ 3, NaN ] )
},
{   test : `Fun.trait: reactive`,
    code : function () {
        let SERVER = new Graph ( 'server' )
        let sideEffected

        SERVER.a = 1
        SERVER.b = new Fun ( 
            s => sideEffected = s.a + 2, 
            {   reactive    : true,
                getHandler  : false
            } 
        )

      //console.log (   sideEffected,
      //                
      //                SERVER.a = 1, 
      //                sideEffected,
      //                SERVER.a = 2, 
      //                sideEffected,
      //            ) 
        return JSON.stringify ( [  
            sideEffected,
            SERVER.a = 1, sideEffected,
            SERVER.a = 2, sideEffected,
        ] )
    },
    want : JSON.stringify ( [ null, 1, 3, 2, 4  ] )
},
//*/
/*
{   test : `Graph Logger (canon) ( works, but test has yet to be written completely)`,
    code : function () {
        let S  = new Graph ( 'server' )
        let GRAPH   = S ( 'graph' )

        S.a = 1 
        S.b = new Fun ( q => { 
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
//*/
{   test : `D3 graph visualiser`,
    code : function () {

        let S       = new Graph ( 'server' )
        let GRAPH   = S ( 'graph' )
  
        graphViewer ( S ) 
        
        S.abacus = 1 
        //S.donkey = 2
        S.blanket = new Fun ( q => { 
            //q.changeAVeryLongKeyName = Math.random()
            q.abacus
            return true 
        } )  



        S.abacus


        setTimeout ( () => {
            //S.d = {}
            //delete S.abacus
        }, 2000 )
        setTimeout ( () => {
            //S.e = null
            //console.log ( S('vertices') )
        }, 4000 )
        setTimeout ( () => {
            //S.f = 1
            //S.abacus = 3.142 
            //S.donkey = 2
            //S.blanket
        }, 6000 )


//for ( const note of GRAPH.log.canon.book ) {
//    console.error (
//      //note.timeStamp,
//      note.type,
//      //note.datum.key, ':', note.datum.value
//    )
//}
  




    },
    want : 'legible'
},
/*/
{   test : 'Pointer logging.',
    code : function () {
    
        let S  = new Graph ( 'server' )
        let GRAPH   = S ( 'graph' )

    }
},
{   warning : `On creation of a Fun.traits.hasSinks, sink's cache needs to be
invalidated, unless Fun runs immediately.'
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
is an Fun that you can load into a Datum... this sounds a bit lispy, and I am
not sure if it is feasible.`
},
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
//*/




/* Testing conveniences for the browser:

g = new Graph( 'server' )

//g.d = new Fun ( e => e.a + e.b )

g.e = 1
g.f = 2
g.g = new Fun ( e => e.e + e.f )

g.h = {}
g.h.i = 4
g.h.j = 5
g.h.k = new Fun ( e => e.h.i + e.h.j )

g( 'vertices' )

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

