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
//            response = await getBook(1);

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

function createResponse(data)
{
    return  { 
             statusCode: 200,
             body: JSON.stringify(data)
            }
}

async function getAllBooks()
{
    let data = [];
    await pool.query('SELECT * FROM book')
            .then((res) => data = res.rows)
            .catch((err) => console.log(err));
            
    return createResponse(data);
}

async function getBook(b_id)
{
    let data = [];
    let book_id
    await pool.query(`SELECT * FROM book WHERE book_id=${b_id}`)
            .then((res) => data = res.rows)
            .catch((err) => console.log(err));
            
    return createResponse(data);
}


