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

{   test : `Build a reactive datastore, where each datum is represented by a Proc instance.`,
    code : function () {

let n1 = new Serl.Node('Node 1')
let p1 = n1.spawn()
//let p2 = n2.spawn()
console.log ( n1 )

    },
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
