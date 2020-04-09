export { seeServer }

// D3 visualisation experiment:
function seeServer ( graphServer ) {

    let 

    verbosity       = 0,    // larger is noisier
    nodeData        = [],
    linkData        = [],
    width           = window.innerWidth,
    height          = window.innerHeight / 2,

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


    zoom 
    = d3.zoom()
        .scaleExtent([.1, 4])
        .on( "zoom", () =>  svg_positionerG
                            .transition ()
                            .duration ( 400 )
                            .ease ( d3.easeCubicOut ) 
                            .attr ( "transform", d3.event.transform ) 
        ),

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
        )
        .call ( zoom ),

    svg_defs
    = body_svg
        .append ('defs')
            // lifted from 
            // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
        .html(  
            `<marker    id="arrowInSink"    viewBox="0 0 10 10"
                        refX="23"           refY="5"
                        markerWidth="4"     markerHeight="4"
                        fill="red"          fill-opacity="0.7"
                        orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker     id="arrowInSource"  viewBox="0 0 10 10"
                        refX="-15"          refY="5"
                        markerWidth="4"     markerHeight="4"
                        fill-opacity="0.7"
                        orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            `
        ),

    svg_positionerG 
    = body_svg
        .append ( 'g' )
        .attr ('graph-viewer-role','positioner'),
               
        positionerG_manyLinksG
        = svg_positionerG
            .append ( 'g' )
            .attr ('graph-viewer-role','link-groups'),

            manyLinksG_oneLinkGs    
            = positionerG_manyLinksG
                .selectAll (),
        
            //  The SELECTION (manyLinksG_oneLinkGs)'s FIRST reference.
            //  This has one group for each <g>1 in svg_positionerG;
            //  groups will be empty as <g>2s have not been appended.

        positionerG_manyNodesG
        = svg_positionerG
            .append ( 'g' )
            .attr ('graph-viewer-role','node-groups'),

            manyNodesG_oneNodeGs    
            = positionerG_manyNodesG
                .selectAll (),
        
            //  The SELECTION (manyNodesG_oneNodeGs)'s FIRST reference.
            //  This has one group for each <g>1 in svg_positionerG;
            //  groups will be empty as <g>2s have not been appended.

////////////////////////////////////////////////////////////////////////////////
    tickHandler = () => 
    {

        //console.log ( `NODES`, p ( nodeData ) )
        //console.log ( `LINKS`, p ( linkData ) )

        manyNodesG_oneNodeGs
            .attr ( 'transform', d => `translate ( ${d.x}, ${d.y} )` )

        manyLinksG_oneLinkGs
            .selectAll ( 'path' )
            .attr ( 'd', d => { 
                return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
            } )
    },
////////////////////////////////////////////////////////////////////////////////

    forceLink 
    = d3.forceLink ( linkData )
        .id ( d => d.key ),

    // The Force Simulation IS STARTED Here:

    simulation 
    = d3.forceSimulation ( nodeData )
        .force ( '?x',          d3.forceX (   ) )
        .force ( '?y',          d3.forceY (   ) )
        .force ( '?collision',  d3.forceCollide (70) )
        .force ( '?links',      forceLink )
        .velocityDecay  ( .5 )
        .on ( 'tick', tickHandler ),
                                                                  
    updateSimulation = ( latest ) => 
    {
        verbosity > 1 && console.group ( `UPDATE SIMULATION`  )
        verbosity > 2 && console.warn ( `^(begins)`, p ( latest ) )

////////////////////////////////////////////////////////////////////////////////
        // Ensure that SIMULATION knows (NODE Ontology),
        //                              (LINK Ontology).
        try {
            simulation  .nodes ( latest.nodeData ) 
        } catch (e) {
            console.error (`.nodes() data updated`, e)
        }
        try {

            verbosity > 2 && console.log( `BEFORE links()`, p( forceLink.links()) )
            verbosity > 2 && console.log( `latest.linkData()`, p( latest.linkData) )

            forceLink   .links ( latest.linkData ) 

            verbosity > 2 && console.log( `AFTER links()`, p(forceLink.links()) )

        } catch (e) {
            console.error (`.links() data updated`, e)
        }

////////////////////////////////////////////////////////////////////////////////

        let nodeNotScript      = '#6af',
            nodeScriptStale    = '#550',
            nodeScriptFresh    = '#ee0',

            nodeHit         = '#6d8',
            nodeMiss        = '',
            nodeDeleted     = '#000'

        // Ensure that (element ontology) has a 1-1 mapping to (NODE Ontology)

        manyNodesG_oneNodeGs   // The SELECTION (manyNodesG_oneNodeGs)'s SECOND reference. 
        = manyNodesG_oneNodeGs

            .data ( latest.nodeData , d => d.key  )
                
                //  This DATA GROUP is then JOINED to ELEMENT GROUP,
                //  manyNodesG[graph-viewer-role=node-groups], 
                //  in the SELECTION (manyNodesG_oneNodeGs).

            .join 
            (
                enterer =>
                {
                        // Each (enterer) is a datum in the
                        // group,manyNodesG[graph-viewer-role=node-groups], which
                        // isn't already mapped to a oneNodeGs element.

                    let oneNodeGs = enterer
                        .append ( 'g' )
                        .call   ( d3.drag()
                                    .on( 'start',   d => { 
                                        if ( ! d3.event.active ) {
                                            simulation.alpha(0.2).restart() }
                                    } )
                                    .on( 'drag',    d => {
                                        d.x = d3.event.x
                                        d.y = d3.event.y
                                    } )
                        ) 
                            // console.log ( Object.is(d, d3.event.subject),  d, d3.event ) 
                            // https://bl.ocks.org/mapio/53fed7d84cd1812d6a6639ed7aa83868
                            // CONSIDER THIS REFERENCE
                    
                    let circle = oneNodeGs
                        .append ( 'circle' )
                            .attr ( 'r', 12 )
                            .attr ( 'fill', 
                                    d =>    d.lambda 
                                            ? ( d.stale 
                                                ? nodeScriptStale 
                                                : nodeScriptFresh
                                              )
                                            : nodeNotScript
                            )
                            .attr ( 'stroke', 
                                    d => d.lambda ? '#000' : '#fff' 
                            )

                    let foreignObject = oneNodeGs
                        .append( 'foreignObject' )
                            .attr  ( 'x', '5')
                            .attr  ( 'y', '5')
                            .attr  ( 'width', '100')
                            .style ( 'overflow', 'visible' )

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
  
                    return oneNodeGs 
                },
                updater => 
                {
                    let circle = updater
                        .select ( 'circle' )
                        .transition()
                        .duration ( 300 ) 
                            .attr ( 'fill', 
                                d =>    d.hit 
                                        ? nodeHit
                                        : ( d.lambda
                                            ? ( d.stale
                                                ? nodeScriptStale
                                                : nodeScriptFresh
                                              ) 
                                            : nodeNotScript 
                                          )
                            )
                        .transition()
                            .attr ( 'fill',                 
                                d =>    d.lambda 
                                        ? ( d.stale 
                                            ? nodeScriptStale 
                                            : nodeScriptFresh
                                          )
                                        : nodeNotScript
                            )
                    let div = updater 
                        .select( 'div' )
                            .text ( d => d.key + ' : ' + d.value )

                    //  This seems insanely expensive; 
                    //  find a cheaper way later. FIXME
                    return updater
                },
                exiter => 
                { 
                    let circle = exiter
                        .select ( 'circle' )
                        .transition ()
                        .ease ( d3.easeCubicOut )

                            .transition () 
                                .attr ( 'fill', nodeDeleted )
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

        manyLinksG_oneLinkGs   // The SELECTION (manyLinksG_oneLinkGs)'s SECOND reference. 
        = manyLinksG_oneLinkGs

            .data ( latest.linkData, d => d.key )
                
                //  This DATA GROUP is then JOINED to ELEMENT GROUP,
                //  manyLinksG[graph-viewer-role=link-groups], 
                //  in the SELECTION (manyLinksG_oneLinkGs).

            .join 
            (
                enterer =>
                {
                        // Each (enterer) is a datum in the
                        // group,manyNodesG[graph-viewer-role=node-groups], which
                        // isn't already mapped to a oneLinkGs element.

                    let oneLinkGs = enterer
                        .append ( 'g' )
 
                    let path = oneLinkGs 
                        .append ( 'path' )
                            .attr ( 'stroke-opacity',   '0.3' )
                            .attr ( 'stroke',           '#000') 
                            .attr ( 'marker-start', d => 
                                    d.location == d.source.key
                                    ? 'url(#arrowInSource)'
                                    : null 
                                  )
                            .attr ( 'marker-end', d => 
                                    d.location == d.source.key
                                    ? null 
                                    : 'url(#arrowInSink)'
                                  )
                    return oneLinkGs 
                },
            )

////////////////////////////////////////////////////////////////////////////////
        //simulation.stop()
        simulation.alpha (1).restart()
////////////////////////////////////////////////////////////////////////////////

        verbosity > 2 && console.warn ( `v(ends)`, p ( latest ) )
        verbosity > 1 && console.groupEnd ( `UPDATE SIMULATION`  )
    },

    connectGraphLogToSimulation  = ( __server, __nodeData, __linkData ) => 
    {
        verbosity && console.group ( `CONNECT GRAPH LOG TO SIMULATION` )

        let graph       = __server ( 'graph' )

        graph.log.canon.tasks.graphViewer 
        = boxedValue => new Promise ( ( F, R ) => {

            verbosity > 1 && (  
                console.group ( `async GraphViewer GRAPH.LOG.CANON.TASK`, boxedValue.type),
                console.warn  ( `key:`, boxedValue.datum.key, "\n",
                                `value:`, boxedValue.datum.value, "\n",
                                `stale:`, boxedValue.datum.stale, "\n",
                                boxedValue
                              ) 
            )

            // Not all cases of the switch require all the following; separate
            // to two switches? FIXME

            let index = __nodeData.findIndex ( 
                e => e.key == boxedValue.datum.key
            )

            if ( ~index ) { // Found an index; remove ephemeral signals.
                delete __nodeData[ index ].hit
                delete __nodeData[ index ].miss
            }

            let nodeDatum = {
                key     : boxedValue.datum.key,
                value   : boxedValue.datum.value,
                lambda  : boxedValue.datum.lambda ,
                    // This should destructively update the .lambda
                    // field if .lambda no longer exists here.
                stale   : boxedValue.datum.stale
            }
            let pushNodeButPreferAssign = ( __index, __nodeDatum) => {
                if ( ~__index ) { // Found an index; replace element.
                    Object.assign ( __nodeData[ index ], __nodeDatum )
                }
                else {          // Found no index; add element.
                    __nodeData.push ( __nodeDatum )
                }
            }

            let sourceKey 
            let sinkKey
            let locatedInSink

            let pushLink = 
                ( __sourceKey, __sinkKey, __locationKey, __locationIndex ) => {
                    __linkData.push ( {
                        source  : __sourceKey, 
                        target  : __sinkKey,
                        type    : 'causal',
                        
                        location: __locationKey,
                            //  'location' is The Datum whose record is being
                            //  communiated to the forceSimulation; 
                            //  both source and target/sink Datum instances will
                            //  store a pointer; the pointers are redundant from the
                            //  Graph's point of view.

                        locationIndex : __locationIndex
                            //  'locationIndex' is the location Datum's
                            //  .pointers.in.causal[ index ] for this pointer.
                } ) 
            }
            
            // argument is a boolean
            let pushLastLinkIn  = ( locatedInSink ) => {
                let causalIndex 
                    = boxedValue.datum.pointers.in.causal.length - 1
                sourceKey       
                    = boxedValue.datum.pointers.in.causal[ causalIndex ].ikey
                sinkKey         
                    = boxedValue.datum.key
                pushLink (  sourceKey, 
                            sinkKey, 
                            locatedInSink ? sinkKey : sourceKey,
                            causalIndex
                         )
            }

            // argument is a boolean
            let pushLastLinkOut = ( locatedInSink ) => {
                let causalIndex
                    = boxedValue.datum.pointers.out.causal.length - 1
                sourceKey       
                    = boxedValue.datum.key
                sinkKey         
                    = boxedValue.datum.pointers.out.causal[ causalIndex ].okey
                pushLink (  sourceKey, 
                            sinkKey, 
                            locatedInSink ? sinkKey : sourceKey,
                            causalIndex
                         )
            }

            switch ( boxedValue.type ) {
                
                case 'delete_vertex_vertexDelete' :
                    verbosity && console.warn ( `DELETE` )
                    __nodeData = __nodeData.filter (
                        vertex => vertex.key != boxedValue.datum.key
                    )
                    break

                case 'get_vertex_hit_vertexGetTyped' :
                    verbosity && console.warn ( `GET, HIT, NOT SCRIPT` )
                    if ( ~index ) { // Found an index; report.
                        __nodeData[ index ].hit = true
                    }
                    else {          // Found no index; complain.
                        R (`d3 visualiser (get_vertex_hit_vertexGetTyped) :
                            __nodeData has no node with the key : 
                            ${ boxedValue.datum.key }; perhaps a major problem.` )
                    }
                    break

                case 'get_vertex_hit_runScriptAndLog' :
                    verbosity && console.warn ( `GET, HIT, SCRIPT` )
                    if ( ~index ) { // Found an index; report.
                        __nodeData[ index ].hit = true
                    }
                    else {          // Found no index; complain.
                        R (`d3 visualiser (get_vertex_hit_vertexGetTyped) :
                            __nodeData has no node with the key : 
                            ${ boxedValue.datum.key }; perhaps a major problem.` )
                    }
                    break

                case 'get_vertex_miss_runScriptAndLog' :
                    verbosity && console.warn ( `GET, MISS, Script` )
                    if ( ~index ) { // Found an index; report.
                        __nodeData[ index ].miss = true
                        __nodeData[ index ].stale = boxedValue.datum.stale
                        __nodeData[ index ].value = boxedValue.datum.value
                    }
                    else {          // Found no index; complain.
                        R (`d3 visualiser (get_vertex_miss_runScriptAndLog) :
                            __nodeData has no node with the key : 
                            ${ boxedValue.datum.key }; perhaps a major problem.` )
                    }
                    break

                case 'set_vertex_vertexSet' :
                    verbosity && console.warn ( `SET, NOT SCRIPT` )
                    pushNodeButPreferAssign ( index, nodeDatum)
                    break

                case 'set_vertex_Script_vertexSet' :
                    verbosity && console.warn ( `SET,SCRIPT`, nodeDatum )
                    pushNodeButPreferAssign ( index, nodeDatum)

                    break

                case 'set_pointer_in_CAUSAL_scopedScriptKeySnifferHandlerGet' :
                   
                    verbosity && console.warn ( `SCRIPT hasSources: own PointerIn` )
                    pushLastLinkIn ( locatedInSink = true )
                    break

                case 'set_pointer_out_CAUSAL_scopedScriptKeySnifferHandlerGet' :
                    
                    verbosity && console.warn ( `SCRIPT hasSources: SOURCE's PointerOut` )
                    pushLastLinkOut ( locatedInSink = false )
                    break
  
                case 'set_pointer_in_CAUSAL_scopedScriptKeySnifferHandlerSet' :
                    
                    verbosity && console.warn ( `SCRIPT hasSinks: set SINK's PointerIn` )
                    pushLastLinkIn ( locatedInSink = true )
                    break

                case 'set_pointer_out_CAUSAL_scopedScriptKeySnifferHandlerSet' :
                                                   
                    verbosity && console.warn ( `SCRIPT hasSinks: set own PointerOut` )
                    pushLastLinkOut ( locatedInSink = false )

                        // If sink-Datum did not previously exist, then we need to
                        // insert a placeholder node into the forceSimulation

                      //let placeholderIndex = __nodeData.findIndex ( 
                      //    e => e.key == sinkKey 
                      //)
                      //if ( ! ( ~ placeholderIndex ) ) { // Index not found. 
                      //    __nodeData.push ( { key: sinkKey } ) 
                      //}
                    break

             default:
                R ( `d3 visualiser : unknown (log) boxedValue.type: ${boxedValue.type}` )
            }

            updateSimulation    ( { nodeData: __nodeData,
                                    linkData: __linkData
                                } ) 

            verbosity && console.groupEnd ( `async GraphViewer GRAPH.LOG.CANON.TASK`, boxedValue.type) 

            //new Promise ( (_F, _R) => console.error ( `test`, _F() ) )

            F ( 'd3 visualiser, updated' )
        } )
        
        verbosity && console.groupEnd ( `CONNECT GRAPH LOG TO SIMULATION` )
    }

    // end of (let)s - continue imperatives:

    zoom.translateBy (  body_svg
                            .transition ()
                            .duration ( 400 )
                            .ease ( d3.easeCubicOut ), 
                        width / 2, 
                        height / 2 
    )

    connectGraphLogToSimulation ( graphServer, nodeData, linkData )

    return {
        simulation  : simulation,
        update      : updateSimulation,
        nodeData    : nodeData,
        linkData    : linkData
    }
}
