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
        case event.path === '/books' && event.httpMethod === 'GET':
            response = await getAllBooks();
        break;
        case event.resource === '/book/{bookId}' && event.httpMethod === 'GET':
            response = await getBook(event.pathParameters.bookId);
        break;
        case event.resource === '/book' && event.httpMethod === 'POST':
            response = await addBook(JSON.parse(event.body));
        break;
        /*
        case event.path === '/book'  && event.httpMethod === 'POST':
            response = await addBook();
        break;
        case event.path === '/book'  && event.httpMethod === 'PATCH':
            response = await updateBook();
        break;
        case event.path === '/book'  && event.httpMethod === 'DELETE':
            response = await deleteBook();
        break;
        */

    }
    
    return response;
}

/*********************************************************
 * Function that builds the response object to be sent back
 * to the client as the http response.
 *********************************************************/
function createResponse(body)
{
    return  { 
             statusCode: 200,
             body: JSON.stringify(body)
            }
}


/*****************************************************************
 * Function that utilizes SQL to retrieve all entries from the BOOK 
 * table. It returns an object with a successful status code and the 
 * body of the object which is the result of the query (all table rows) 
 * stringified into JSON format for the http response.
 *****************************************************************/
async function getAllBooks()
{
    let data = [];
    await pool.query('SELECT * FROM book')
            .then((res) => data = res.rows)
            .catch((err) => console.log(err));
            
    return createResponse(data);
}


/*****************************************************************
 * Function that utilizes SQL to retrieve one entry from the BOOK 
 * table with an specific book_id. It returns an object with a 
 * successful status code and the body of the object which is the 
 * result of the query (the row) stringified 
 * into JSON format for the http response.
 *****************************************************************/
async function getBook(b_id)
{
    let data = [];
    let book_id
    await pool.query(`SELECT * FROM book WHERE book_id=${b_id}`)
            .then((res) => data = res.rows)
            .catch((err) => console.log(err));
            
    return createResponse(data);
}


/*******************************************************************
 * Function that used SQL to insert an item into the BOOK table. The
 * new item is received as parameter as an object that was JSON parsed.
 * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
 * (and expressions based on columns) that were modified by an insert, 
 * delete or update.
********************************************************************/
async function addBook(b)
{
    let addedItem;

//    await pool.query(`INSERT INTO book (title, category, description) VALUES ( ${b.title}, ${b.category}, ${b.desc} )` )
    await pool.query('INSERT INTO book (title, category, description) VALUES ($1, $2, $3) RETURNING *', [b.title, b.category, b.desc])
            .then((res) => addedItem = res.rows[0])
            .catch((err) => console.log(err));

    return createResponse(addedItem);
}

