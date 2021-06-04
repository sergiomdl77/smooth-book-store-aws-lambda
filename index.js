const { Pool, Client } = require('pg')

// The Pool class is used to make the postgres connection cached and therefore
// reusable throughout the entire session, as opposed to creating a new
// connection after every http request.
const pool = new Pool({
    user: 'sergiomdl77',
    host: 'book-store-bd-instance.canbliboxxf8.us-east-1.rds.amazonaws.com',
    database: 'book_store_db',
    password: 'Guate1996!',
    port: 5432
})


exports.handler = async (event) => {
    console.log(event);
    pool.connect();
    let response = {};


    switch(true){
        case event.resource === '/books' && event.httpMethod === 'GET':
            response = await getAllBooks();
        break;
        case event.resource === '/book/{bookId}' && event.httpMethod === 'GET':
            response = await getBook(event.pathParameters.bookId);
        break;
        case event.resource === '/book' && event.httpMethod === 'POST':
            response = await addBook(JSON.parse(event.body));
        break;
        case event.resource === '/book/{bookId}'  && event.httpMethod === 'PUT':
            response = await updateBook(JSON.parse(event.body), event.pathParameters.bookId);
        break;
        case event.resource === '/book/{bookId}'  && event.httpMethod === 'DELETE':
            response = await deleteBook(event.pathParameters.bookId);
        break;
        default:    
            response = createResponse(404,'404. Not Found.');


    }
    
    return response;
}

/*********************************************************
 * Function that builds the response object to be sent back
 * to the client as the http response.
 *********************************************************/
function createResponse(status, responseBody)
{
    return  { 
             statusCode: status,
             body: JSON.stringify(responseBody)
            }
}


/*****************************************************************
 * Function that utilizes SQL to retrieve all entries from the BOOK 
 * table. It returns an object with a successful status code and the 
 * body of the object which is the result of the query (list of table rows
 * as objects) stringified into JSON format for the http response.
 *****************************************************************/
async function getAllBooks()
{
    let retrieved = [];
    await pool.query('SELECT * FROM book')
            .then((results) => retrieved = results.rows)
            .catch((error) => console.log(error));
            
    return createResponse(200, retrieved);
}


/*****************************************************************
 * Function that utilizes SQL to retrieve one entry from the BOOK 
 * table with an specific book_id. It returns an object with a 
 * successful status code and the body of the object which is the 
 * result of the query (the retrieved row as an object) stringified 
 * into JSON format for the http response.
 *****************************************************************/
async function getBook(b_id)
{
    let retrieved = [];
    let book_id
    await pool.query(`SELECT * FROM book WHERE book_id=${b_id}`)
            .then((results) => retrieved = results.rows[0])
            .catch((error) => console.log(error));
            
    return createResponse(200, retrieved);
}


/*******************************************************************
 * Function that used SQL to insert an entry into the BOOK table. The
 * new item is received as parameter as an object that was JSON parsed.
 * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
 * (and expressions based on columns) that were modified by an insert, 
 * delete or update. It returns an object with a successful status 
 * code and the body of the object which is the result of the query (the 
 * retrieved row as an object) stringified into JSON format for the 
 * http response. 
********************************************************************/
async function addBook(b)
{
    let addedBook;

    await pool.query('INSERT INTO book (title, category, description) VALUES ($1, $2, $3) RETURNING *', 
           [b.title, b.category, b.desc])
            .then((results) => addedBook = results.rows[0])
            .catch((error) => console.log(error));

    return createResponse(200, addedBook);
}

/*****************************************************************
 * Function that utilizes SQL to update one entry from the BOOK 
 * table with an specific book_id. The new attributes of the entry
 * to be modified will be received as an object that was JSON parsed.
 * It returns an object with a successful status code and the body 
 * of the object which is the result of the query (the updated row as
 * an object) stringified into JSON format for the http response.
 *****************************************************************/
 async function updateBook(b, b_id)
 {
    let updatedBook;

    await pool.query('UPDATE book SET title = $1, category = $2, description = $3 WHERE book_id = $4 RETURNING *',
           [b.title, b.category, b.desc, b_id])
            .then((results) => updatedBook = results.rows[0])
            .catch((error) => console.log(error));

    return createResponse(200, updatedBook);
 }
 
/*******************************************************************
 * Function that used SQL to delete an entry from the BOOK table. The
 * id of the book entry to delete is received as parameter.
 * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
 * (and expressions based on columns) that were modified by an insert, 
 * delete or update. It returns an object with a successful status 
 * code and the body of the object which is the result of the query (the 
 * deleted row as an object) stringified into JSON format for the 
 * http response. 
********************************************************************/
async function deleteBook(b_id)
{
   let deletedBook;

   await pool.query('DELETE FROM book WHERE book_id = $1 RETURNING *', [b_id])
           .then((results) => deletedBook = results.rows[0])
           .catch((error) => console.log(error));

   return createResponse(200, deletedBook);
}
