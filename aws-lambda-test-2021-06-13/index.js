'use strict'

exports.handler = async (event) => {
    
    const {     Graph : Graph,
                Script : Script
                
    } = require( '/var/task/store.js' )
    
    const CS = new Graph ( 'store' )
    
    CS.a = 1
    CS.b = 2
    CS.c = new Script ( g => g.a + g.b )
    
    
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify( CS.c ),
    };
    return response;
};