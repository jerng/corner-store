export { chart }

let p = thing => JSON.stringify ( thing, null, 4 )

// D3 visualisation experiment:
function chart ( graphServer ) {

    const 

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
        //.scaleExtent([.1, 4])
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
        .attr ( 'style',   `background-color: #f8f8f8;
                            font-family: Roboto, Helvetica, sans-serif;
                            font-weight: 300;
                            font-size: 16px;`
        )
        .call ( zoom )

    let

    svg_positionerG 
    = body_svg
        .append ( 'g' )
        .attr ('graph-viewer-role','positioner'),
               
        positionerG_manyLinksG
        = svg_positionerG
            .append ( 'g' )
            .attr ('graph-viewer-role','link-groups'),

////////////////////////////////////////////////////////////////////////////////
            manyLinksG_oneLinkGs    
            = positionerG_manyLinksG
                .selectAll (),
////////////////////////////////////////////////////////////////////////////////
        
            //  The SELECTION (manyLinksG_oneLinkGs)'s FIRST reference.
            //  This has one group for each <g>1 in svg_positionerG;
            //  groups will be empty as <g>2s have not been appended.

        positionerG_manyNodesG
        = svg_positionerG
            .append ( 'g' )
            .attr ('graph-viewer-role','node-groups'),

            manyNodesG_oneNodeGs    
            = positionerG_manyNodesG
                .selectAll ()
        
            //  The SELECTION (manyNodesG_oneNodeGs)'s FIRST reference.
            //  This has one group for each <g>1 in svg_positionerG;
            //  groups will be empty as <g>2s have not been appended.

////////////////////////////////////////////////////////////////////////////////
    
    const
    
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
        .id ( d => d.key )
        .distance ( 200 ) ,

    // The Force Simulation IS STARTED Here:

    simulation 
    = d3.forceSimulation ( nodeData )
        .force ( '?x',          d3.forceX (   ) )
        .force ( '?y',          d3.forceY (   ).strength(0.5) )
        .force ( '?collision',  d3.forceCollide (70) )
        .force ( '?links',      forceLink )
        .velocityDecay  ( .5 )
        .on ( 'tick', tickHandler ),
                                                                  
    updateSimulationAndDOM = ( latest ) => 
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

        const   

        nodeNotScript       = '#6af',
        nodeScriptStale     = '#550',
        nodeScriptFresh     = '#f90',

        nodeHit             = '#6d8',
        nodeMiss            = '#f00',
        nodeDeleted         = '#000',

        nodeRDefault        = 12,
        nodeRDeleted        = 20,

        nodeBGDefault       = d =>  ( ! d.lambda 
                                      ? nodeNotScript
                                      : ( d.stale 
                                          ? nodeScriptStale 
                                          : nodeScriptFresh ) ),
                                          
        labelBGDefaultCode  = 'rgba(255,255,255,0.3)',

        labelBGOpaque = function() {  
            d3.select(this)
                .select('div')
                .transition()
                .duration( 0 )
                .style('background-color','#fff')
        },

        labelBGReset = function() {  
            d3.select(this)
                .select('div')
                .transition()
                .duration( 500 )
                .style('background-color',labelBGDefaultCode)
        },

        labelHtml = d => d.key 
                    + ' : <b style="font-weight:600">' 
                    + d.value 
                    + '</b>',

        pathStrokeWidthDefault      = 3,
        pathStrokeWidthDeleted      = 12,
        pathStrokeWidthTraversed    = 12,

        pathStrokeDefault           = '#000',
        pathStrokeTraversed         = nodeScriptFresh,
        pathStrokeDeleted           = '#f00',

        pathStrokeOpacityDefault    = 0.05,
        pathStrokeOpacityTraversed  = 1,

        pathMarkerStartDefault  = d => 
                                    d.location == d.source.key
                                    ? 'url(#arrowInSource)'
                                    : null, 
        pathMarkerEndDefault    = d => 
                                    d.location == d.source.key
                                    ? null 
                                    : 'url(#arrowInSink)',
        pathMarkerStartDeleted  = d => 
                                    d.location == d.source.key
                                    ? 'url(#arrowInSourceDeleted)'
                                    : null,
        pathMarkerEndDeleted    = d => 
                                    d.location == d.source.key
                                    ? null 
                                    : 'url(#arrowInSinkDeleted)',
                    //  Possible performance optimisation here.
                    //  Store markers in __data__ instead of
                    //  checking every time. FIXME

        svg_defs
        = body_svg
            .append ('defs')
                // lifted from 
                // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
            .html(  
                `<marker    id="arrowInSink"    viewBox="0 0 10 10"
                            refX="23"           refY="5"
                            markerWidth="4"     markerHeight="4"
                            fill="#f00"         stroke-width="3" 
                            orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                <marker     id="arrowInSource"  viewBox="0 0 10 10"
                            refX="-15"          refY="5"
                            markerWidth="4"     markerHeight="4"
                            fill="black"        stroke-width="3" 
                            orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                <marker     id="arrowInSinkDeleted"    
                            viewBox="0 0 10 10"
                            refX="23"           refY="5"
                            markerWidth="1"     markerHeight="1"
                            fill="#f00"         stroke-width="3" 
                            orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                <marker     id="arrowInSourceDeleted"  
                            viewBox="0 0 10 10"
                            refX="-15"          refY="5"
                            markerWidth="1"     markerHeight="1"
                            fill="black"        stroke-width="3" 
                            orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>

                `
            )
/////////////////////////////////////////////////////////////////////////////////8888888888

        // Ensure that (element ontology) has a 1-1 mapping to (NODE Ontology)

        manyNodesG_oneNodeGs   // The SELECTION (manyNodesG_oneNodeGs)'s SECOND reference. 
        = manyNodesG_oneNodeGs

            .data ( latest.nodeData , d => d.key  )
                
                //  This DATA GROUP is then JOINED to ELEMENT GROUP,
                //  manyNodesG[graph-viewer-role=node-groups], 
                //  in the SELECTION (manyNodesG_oneNodeGs).

            .join 
            (
                __manyNodesG_oneNodeGs =>   // entering SELECTION
                {
                        // Each (enterer) is a datum in the
                        // group,manyNodesG[graph-viewer-role=node-groups], which
                        // isn't already mapped to a oneNodeGs element.

                    let oneNodeGs 
                    = __manyNodesG_oneNodeGs 
                        // Programmer does not understand what is going on here.
                        // FIXME
                        .append ( 'g' )
                        .on ( 'mouseover',  labelBGOpaque )
                        .on ( 'mouseout',   labelBGReset )
                        .call ( d3.drag()
                                .on( 'start',   d => { 

                                    //  Restarts simulation AFTER 
                                    //  it has stopped; some heat needed.
                                    
                                    if ( ! d3.event.active ) {
                                        simulation.alpha(0.1).restart() }
                                } )
                                .on( 'drag',    d => {
                                    d.x = d3.event.x
                                    d.y = d3.event.y
                                    
                                    // Reheats simulation during drag.

                                    simulation.alpha(0.1)
                                } )
                        ) 
                            // console.log ( Object.is(d, d3.event.subject),  d, d3.event ) 
                            // https://bl.ocks.org/mapio/53fed7d84cd1812d6a6639ed7aa83868
                            // CONSIDER THIS REFERENCE
                    
                    let circle 
                    = oneNodeGs
                        .append ( 'circle' )
                            .attr ( 'r', nodeRDefault )
                            .attr ( 'fill', nodeBGDefault )
                            .attr ( 'stroke', 
                                    d => d.lambda ? '#000' : '#fff' 
                            )
                    
                    let foreignObject
                    = oneNodeGs
                        .append( 'foreignObject' )
                            .attr  ( 'x', '5')
                            .attr  ( 'y', '5')
                            .attr  ( 'width', '100')
                            .style ( 'overflow', 'visible' )


                    let div
                    = foreignObject
                        .append( 'xhtml:div' )
                            .attr( 'style',    
                                   `padding: 5px;
                                    overflow-wrap: break-word; 
                                    border: 1px solid rgba(00,00,00,0.1);
                                    border-radius: 5px;
                                    background-color: ${labelBGDefaultCode};
                                    ` 
                            )
                            .html ( labelHtml )

                            //.on ( 'mouseout', () => )
  
                    return oneNodeGs 
                        // Programmer does not understand what is going on here.
                        // FIXME
                },
                __oneNodeGs => // updating SELECTION
                {

                    // FIXME There should be a way to partition __oneNodeGs into
                    // softDeleted and nonDeleted nodes in one loop instead of
                    // two.

                    // FIXME Replace this with Array.prototype.reduce for neatness:
                    let unSoftDeletedDOMNodes = []
                    let hitDOMNodes = []
                    let missedDOMNodes = []
                    let updatedDOMNodes = []
                    let softDeletedNodeGs
                    =   __oneNodeGs.filter( function( datum, index, elements ){

                            if ( datum.deleted ) 
                            {
                                if (    elements[index]
                                        .firstElementChild
                                        .attributes
                                        .r
                                        .value != nodeRDeleted )
                                {
                                    return true
                                        // Currently in a deleted state;
                                        // but still the wrong style. Address.
                                } else {
                                    return false
                                        // Currently in a deleted state;
                                        // already properly styled. Ignore.
                                }
                            }
                            else 
                            if (    elements[index]
                                    .firstElementChild
                                    .attributes
                                    .r
                                    .value != nodeRDefault )
                            {
                                unSoftDeletedDOMNodes.push ( this )
                                return false
                                    // Currently not in a deleted state;
                                    // but styled wrongly. Address.
                            }
                            else 
                            if ( datum.hit ) {
                                hitDOMNodes.push ( this ) 
                                return false
                                    // Currently not in a deleted state;
                                    // need to add styling. Address. 
                            }
                            else 
                            if ( datum.miss ) {
                                missedDOMNodes.push ( this ) 
                                return false
                                    // Currently not in a deleted state;
                                    // need to add styling. Address. 
                            }
                            else 
                            if ( datum.updated ) {
                                updatedDOMNodes.push ( this ) 
                                return false
                                    // Currently not in a deleted state;
                                    // need to add styling. Address. 
                            }
                            else { return false } // further specification? 
                        } ) 

                    let updatedNodeGs
                    = d3.selectAll ( updatedDOMNodes )

                        let updatedDivs
                        = updatedNodeGs
                            .select ('div')
                            .html ( labelHtml )

                    let hitNodeGs
                    = d3.selectAll ( hitDOMNodes )

                        let hitCircles 
                        = hitNodeGs 
                            .select ( 'circle' )
                            .transition()
                            .duration ( 300 ) 
                                .attr ( 'fill',  nodeHit )
                            .transition()
                                .attr ( 'fill', nodeBGDefault ) 

                    let missedNodeGs
                    = d3.selectAll ( missedDOMNodes )

                        let missedCircles 
                        = missedNodeGs 
                            .select ( 'circle' )
                            .transition()
                            .duration ( 300 ) 
                                .attr ( 'fill',  nodeMiss )
                            .transition()
                                .attr ( 'fill', nodeBGDefault ) 

                        let missedDivs
                        = missedNodeGs
                            .select ('div')
                            .html ( labelHtml )

                    let softDeletedCircles
                    =   softDeletedNodeGs
                        .select ( 'circle' )
                        .transition ()
                        .ease ( d3.easeCubicOut )
                            .attr ( 'fill', nodeDeleted )
                            .attr ('r', nodeRDeleted )
                    
                        softDeletedCircles
                        .transition()
                        .duration ( 3000 ) 
                            .ease ( d3.easeCubicOut )
                            .attr ( 'fill', '#f8f8f8' )

                    let unSoftDeletedNodeGs 
                    = d3.selectAll ( unSoftDeletedDOMNodes )

                        let unSoftDeletedDiv 
                        = unSoftDeletedNodeGs
                            .select( 'div' )
                            .html ( labelHtml )

                        let unSoftDeletedCircles
                        = unSoftDeletedNodeGs
                            .select ( 'circle' )
                            .transition()
                            .duration ( 300 ) 
                                .attr ( 'fill', d => 
                                            ( d.hit 
                                            ? nodeHit
                                            : nodeBGDefault ( d ) )
                                )
                                .attr ( 'r', nodeRDefault )
                            .transition()
                                .attr ( 'fill', nodeBGDefault ) 

                    return __oneNodeGs
                        // Programmer does not understand what is going on here.
                        // FIXME
                },
                exiter => 
                { 
                }

            )

        // Ensure that (element ontology) has a 1-1 mapping to (LINK Ontology)

        manyLinksG_oneLinkGs   // The SELECTION (manyLinksG_oneLinkGs)'s SECOND reference. 
        = manyLinksG_oneLinkGs

            .data ( latest.linkData, d => d.index )
                
                //  This DATA GROUP is then JOINED to ELEMENT GROUP,
                //  manyLinksG[graph-viewer-role=link-groups], 
                //  in the SELECTION (manyLinksG_oneLinkGs).

            .join 
            (
                __manyLinksG_oneLinkGs =>   // entering SELECTION
                {

                      //console.error(`LINKS, enter selection`)
                      //__manyLinksG_oneLinkGs._groups.forEach( e => {

                      //    for ( const f of e ) {
                      //        if ( f ) {
                      //            console.log ( 
                      //                ( f.__data__.deleted ? 'deleted' : '' )
                      //                + ' '
                      //                + f.__data__.source.key 
                      //                + ' > ' 
                      //                + f.__data__.target.key
                      //                + ' in '
                      //                + f.__data__.location
                      //                + ' '
                      //                + f.__data__.debug
                      //            )
                      //        } else {
                      //            console.log ('( null )')
                      //        } 
                      //        
                      //    }

                      //} )


                    // Each (enterer) is a datum in the
                    // group,manyNodesG[graph-viewer-role=node-groups], which
                    // isn't already mapped to a oneLinkGs element.

                        // Programmer does not understand what is going on here.
                        // FIXME
                    let oneLinkGs
                    = __manyLinksG_oneLinkGs 
                        .append ( 'g' )
                            .attr ( 'stroke', pathStrokeDefault ) 
                            .attr ( 'stroke-opacity', pathStrokeOpacityDefault )
                                //  Descendant settings default to these 
                                //  ancestor settings.
 
                    let path 
                    = oneLinkGs 
                        .append ( 'path' )
                            .attr ( 'marker-start', pathMarkerStartDefault )
                            .attr ( 'marker-end', pathMarkerEndDefault )
                            //.attr ( 'location', d => d.location )
                            //.attr ( 'source', d => d.source.key )
                            //.attr ( 'target', d => d.target.key )

                    return oneLinkGs 
                        // Programmer does not understand what is going on here.
                        // FIXME
                },
                __oneLinkGs => // updating SELECTION
                {
                      //console.error(`LINKS, update selection`)
                      //__oneLinkGs._groups.forEach( e => {
                      //    for ( const f of e ) {
                      //        if ( f ) {
                      //            console.log ( 
                      //                ( f.__data__.deleted ? 'deleted' : '' )
                      //                + ' '
                      //                + f.__data__.source.key 
                      //                + ' > ' 
                      //                + f.__data__.target.key
                      //                + ' in '
                      //                + f.__data__.location
                      //                + ' '
                      //                + f.__data__.debug
                      //            )
                      //        } else {
                      //            console.log ('( null )')
                      //        } 
                      //        
                      //    }
                      //} )

                    let paths
                    = positionerG_manyLinksG
                        .selectAll ( 'path' )

                    // FIXME Replace this with Array.prototype.reduce for neatness:
                    let traversedDOMPaths = [] 
                    let unSoftDeletedDOMPaths = []
                    let softDeletedPaths
                    =   paths.filter ( function( datum, index, elements ) 
                        {
                            if ( datum.deleted ) 
                            {
                                if (    elements[index]
                                        .parentNode
                                        .attributes
                                        .stroke
                                        .value != pathStrokeDeleted )
                                {
                                    return true
                                        // Currently in a deleted state;
                                        // but still the wrong style. Address.
                                } else {
                                    return false
                                        // Currently in a deleted state;
                                        // already properly styled. Ignore.
                                }
                            }
                            else 
                            if (    (   ( datum.location == datum.target.key ) 
                                        && datum.target.lambda 
                                        && datum.target.miss
                                    )       //  N is a Script, pointer is in 
                                            //  and points to N, and N had a 
                                            //  cache-miss. 
                                    || 
                                    (   ( datum.location == datum.source.key )
                                        && datum.source.lambda
                                        && ( datum.source.hit || datum.source.miss )
                                    )       //  N is a Script, pointer is in 
                                            //  and points from N, and N had 
                                            //  a cache-miss or cache-hit. 
                               )
                            {
                                traversedDOMPaths.push ( this )
                                return false 
                            }
                            else 
                            if (    elements[index]
                                    .parentNode
                                    .attributes
                                    .stroke
                                    .value != pathStrokeDeleted )
                            {
                                unSoftDeletedDOMPaths.push ( this )
                                return false
                                    // Currently not in a deleted state;
                                    // but styled wrongly. Address.
                            }
                            else { return false } // further specification? 
                        } )
                    
                    softDeletedPaths
                        .interrupt()
                        .attr ( 'stroke', pathStrokeDeleted )
                        .attr ( 'stroke-width', pathStrokeWidthDeleted )
                            // these now override parent settings

                        .attr ( 'marker-start', pathMarkerStartDeleted )
                        .attr ( 'marker-end', pathMarkerEndDeleted )
                                //  Possible performance optimisation here.
                                //  Store markers in __data__ instead of
                                //  checking every time. FIXME

                    let unSoftDeletedPaths 
                    = d3.selectAll ( unSoftDeletedDOMPaths )

                    unSoftDeletedPaths
                        .interrupt()
                        .attr ( 'stroke', null )
                        .attr ( 'stroke-width', null )
                            // these will now default to ancestor's settings

                        .attr ( 'marker-start', pathMarkerStartDefault )
                        .attr ( 'marker-end', pathMarkerEndDefault )
                                //  Possible performance optimisation here.
                                //  Store markers in __data__ instead of
                                //  checking every time. FIXME

                    let traversedPaths 
                    = d3.selectAll ( traversedDOMPaths )

                    traversedPaths
                        .interrupt()
                        .transition(0)
                            .attr ( 'stroke', pathStrokeTraversed )
                            .attr ( 'stroke-opacity', pathStrokeOpacityTraversed )
                                // these now override parent settings

                            .attr ( 'marker-start', null ) 
                            .attr ( 'marker-end', null ) 

                        .transition(0)
                            .attr ( 'stroke', null )
                            .attr ( 'stroke-opacity', null )
                                // these will now default to ancestor's settings

                            .attr ( 'marker-start', d => 
                                d.deleted
                                ?   pathMarkerStartDeleted ( d ) 
                                :   pathMarkerStartDefault ( d ) )
                            .attr ( 'marker-end', d =>
                                d.deleted
                                ? pathMarkerEndDeleted ( d ) 
                                : pathMarkerEndDefault ( d ) )
                                    //  Possible performance optimisation here.
                                    //  Store markers in __data__ instead of
                                    //  checking every time. FIXME

                    return __oneLinkGs
                        // Programmer does not understand what is going on here.
                        // FIXME
                }
            )

////////////////////////////////////////////////////////////////////////////////
        //simulation.stop()
        simulation.alpha(0.1).restart()
////////////////////////////////////////////////////////////////////////////////

        verbosity > 2 && console.warn ( `v(ends)`, p ( latest ) )
        verbosity > 1 && console.groupEnd ( `UPDATE SIMULATION`  )
    },

    connectGraphLogToSimulation  = ( __store, __nodeData, __linkData ) => 
    {
        verbosity && console.group ( `CONNECT GRAPH LOG TO SIMULATION` )

        let graph       = __store ( 'graph' )

        graph.log.canon.tasks.graphViewer 
        = boxedValue => new Promise ( ( F, R ) => {

            verbosity > 1 && (  console.group ( boxedValue.type, `async GraphViewer GRAPH.LOG.CANON.TASK` ),
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
                delete __nodeData[ index ].updated
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

                    // undelete!
                    if ( __nodeData[ __index ].deleted ) {

                        delete __nodeData[ __index ].deleted
                        
                        __linkData.forEach ( e => {
                            if ( e.location == __nodeDatum.key ) {
                                delete e.deleted
                            }
                            // We just modify the old array, we don't use the
                            // new one, so we don't have to return anything.
                        } )
                    }

                    Object.assign ( __nodeData[ __index ], __nodeDatum )
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
                        //debug   : performance.now(),
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
            let pushLastLinkIn  = ( __locatedInSink ) => {
                let causalIndex 
                    = boxedValue.datum.pointers.in.causal.length - 1
                sourceKey       
                    = boxedValue.datum.pointers.in.causal[ causalIndex ].ikey
                sinkKey         
                    = boxedValue.datum.key
                pushLink (  sourceKey, 
                            sinkKey, 
                            __locatedInSink ? sinkKey : sourceKey,
                            causalIndex
                         )
            }

            // argument is a boolean
            let pushLastLinkOut = ( __locatedInSink ) => {
                let causalIndex
                    = boxedValue.datum.pointers.out.causal.length - 1
                sourceKey       
                    = boxedValue.datum.key
                sinkKey         
                    = boxedValue.datum.pointers.out.causal[ causalIndex ].okey
                pushLink (  sourceKey, 
                            sinkKey, 
                            __locatedInSink ? sinkKey : sourceKey,
                            causalIndex
                         )
            }

            switch ( boxedValue.type ) {
                
                case 'delete_vertex_vertexDelete' :
                    verbosity && console.warn ( `DELETE` )
                    if ( ~index ) { // Found an index; report.
                        __nodeData[ index ].deleted = true 
                        __linkData.forEach ( e => {
                            if ( e.location == boxedValue.datum.key ) {
                                e.deleted = true
                            }
                            // We just modify the old array, we don't use the
                            // new one, so we don't have to return anything.
                        } )
                    }
                    else {          // Found no index; complain.
                        R (`d3 visualiser (get_vertex_vertexDelete) :
                            __nodeData has no node with the key : 
                            ${ boxedValue.datum.key }; perhaps a major problem.` )
                    }
                          // Hard delete.
                          //
                          //__nodeData = __nodeData.filter (
                          //    node => node.key != boxedValue.datum.key
                          //)
                          //__linkData = __linkData.filter (
                          //    link => link.location != boxedValue.datum.key
                          //)
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
                    verbosity && console.warn ( `SET,NOT SCRIPT` )
                    if ( ~index ) { // Found an index; report.
                        __nodeData[ index ].updated = true
                    }
                    pushNodeButPreferAssign ( index, nodeDatum)
                    break

                case 'set_vertex_Script_vertexSet' :
                    verbosity && console.warn ( `SET, SCRIPT`, nodeDatum )
                    if ( ~index ) { // Found an index; report.
                        __nodeData[ index ].updated = true
                    }
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

            updateSimulationAndDOM  ( { nodeData: __nodeData,
                                        linkData: __linkData
                                    } ) 

            verbosity > 1 && console.groupEnd ( boxedValue.type, `async GraphViewer GRAPH.LOG.CANON.TASK` )

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
    ) // centering the viewport

    connectGraphLogToSimulation ( graphServer, nodeData, linkData )

    return {
        simulation  : simulation,
        update      : updateSimulationAndDOM,
        nodeData    : nodeData,
        linkData    : linkData
    }
}
