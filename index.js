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
        // Cases that invoke the book or books resources
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

        // Cases that invoke the author or authors resources
        case event.resource === '/authors' && event.httpMethod === 'GET':
            response = await getAllAuthors();
        break;
        case event.resource === '/author/{authorId}' && event.httpMethod === 'GET':
            response = await getAuthor(event.pathParameters.authorId);
        break;
        case event.resource === '/author' && event.httpMethod === 'POST':
            response = await addAuthor(JSON.parse(event.body));
        break;
        case event.resource === '/author/{authorId}'  && event.httpMethod === 'PUT':
            response = await updateAuthor(JSON.parse(event.body), event.pathParameters.authorId);
        break;
        case event.resource === '/author/{authorId}'  && event.httpMethod === 'DELETE':
            response = await deleteAuthor(event.pathParameters.authorId);
        break;

        // Cases that invoke the category or categories resources
        case event.resource === '/categories' && event.httpMethod === 'GET':
            response = await getAllCategories();
        break;
        case event.resource === '/category/{catId}' && event.httpMethod === 'GET':
            response = await getCategory(event.pathParameters.catId);
        break;
        case event.resource === '/category' && event.httpMethod === 'POST':
            response = await addCategory(JSON.parse(event.body));
        break;
        case event.resource === '/category/{catId}'  && event.httpMethod === 'PUT':
            response = await updateCategory(JSON.parse(event.body), event.pathParameters.catId);
        break;
        case event.resource === '/category/{catId}'  && event.httpMethod === 'DELETE':
            response = await deleteCategory(event.pathParameters.catId);
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
             headers : { 'Access-Control-Allow-Origin': '*' },
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

    await pool.query(
    `INSERT INTO book (
        TITLE,
        AUTHOR,  
        DESCR, 
        PRICE, 
        IMAGE_URL, 
        UNITS_IN_STOCK, 
        CAT_ID,  
        RATING) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, 
           [b.title, b.author, b.descr, b.price, b.imageUrl, b.unitsInStock, b.catId, b.rating ])
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

    await pool.query(
        `UPDATE book SET 
            TITLE = $1,
            AUTHOR = $2, 
            DESCR = $3,
            PRICE = $4,
            IMAGE_URL = $5,
            UNITS_IN_STOCK = $6,
            CAT_ID = $7,
            RATING = $8
            WHERE book_id = $9 RETURNING *`,
            [b.title, b.author, b.descr, b.price, b.imageUrl, b.unitsInStock, b.catId, b.rating, b_id ])
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


/*****************************************************************
 * Function that utilizes SQL to retrieve all entries from the AUTHOR 
 * table. It returns an object with a successful status code and the 
 * body of the object which is the result of the query (list of table rows
 * as objects) stringified into JSON format for the http response.
 *****************************************************************/
 async function getAllAuthors()
 {
     let retrieved = [];

     await pool.query('SELECT * FROM author')
             .then((results) => retrieved = results.rows)
             .catch((error) => console.log(error));
             
     return createResponse(200, retrieved);
 }
 
 
 /*****************************************************************
  * Function that utilizes SQL to retrieve one entry from the AUTHOR 
  * table with an specific author_id. It returns an object with a 
  * successful status code and the body of the object which is the 
  * result of the query (the retrieved row as an object) stringified 
  * into JSON format for the http response.
  *****************************************************************/
 async function getAuthor(a_id)
 {
     let retrieved = [];
     await pool.query(`SELECT * FROM author WHERE author_id=${a_id}`)
             .then((results) => retrieved = results.rows[0])
             .catch((error) => console.log(error));
             
     return createResponse(200, retrieved);
 }
 
 
 /*******************************************************************
  * Function that used SQL to insert an entry into the AUTHOR table. The
  * new item is received as parameter as an object that was JSON parsed.
  * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
  * (and expressions based on columns) that were modified by an insert, 
  * delete or update. It returns an object with a successful status 
  * code and the body of the object which is the result of the query (the 
  * retrieved row as an object) stringified into JSON format for the 
  * http response. 
 ********************************************************************/
 async function addAuthor(a)
 {
     let addedAuthor;
 
     await pool.query(
     `INSERT INTO author (
         NAME,  
         BACKGROUND) VALUES ($1, $2) RETURNING *`, 
            [a.name, a.background])
             .then((results) => addedAuthor = results.rows[0])
             .catch((error) => console.log(error));
 
     return createResponse(200, addedAuthor);
 }
 
 /*****************************************************************
  * Function that utilizes SQL to update one entry from the AUTHOR 
  * table with an specific author_id. The new attributes of the entry
  * to be modified will be received as an object that was JSON parsed.
  * It returns an object with a successful status code and the body 
  * of the object which is the result of the query (the updated row as
  * an object) stringified into JSON format for the http response.
  *****************************************************************/
  async function updateAuthor(a, a_id)
  {
     let updatedAuthor;
 
     await pool.query(
         `UPDATE author SET 
             NAME = $1,
             BACKGROUND = $2
             WHERE author_id = $3 RETURNING *`,
             [a.name, a.background, a_id ])
             .then((results) => updatedAuthor = results.rows[0])
             .catch((error) => console.log(error));
 
     return createResponse(200, updatedAuthor);
  }
  
 /*******************************************************************
  * Function that used SQL to delete an entry from the AUTHOR table. The
  * id of the author entry to delete is received as parameter.
  * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
  * (and expressions based on columns) that were modified by an insert, 
  * delete or update. It returns an object with a successful status 
  * code and the body of the object which is the result of the query (the 
  * deleted row as an object) stringified into JSON format for the 
  * http response. 
 ********************************************************************/
 async function deleteAuthor(a_id)
 {
    let deletedAuthor;
 
    await pool.query('DELETE FROM author WHERE author_id = $1 RETURNING *', [a_id])
            .then((results) => deletedAuthor = results.rows[0])
            .catch((error) => console.log(error));
 
    return createResponse(200, deletedAuthor);
 }
 
 /*****************************************************************
 * Function that utilizes SQL to retrieve all entries from the CATEGORY 
 * table. It returns an object with a successful status code and the 
 * body of the object which is the result of the query (list of table rows
 * as objects) stringified into JSON format for the http response.
 *****************************************************************/
async function getAllCategories()
{
    let retrieved = [];

    await pool.query('SELECT * FROM category')
            .then((results) => retrieved = results.rows)
            .catch((error) => console.log(error));
            
    return createResponse(200, retrieved);
}


/*****************************************************************
 * Function that utilizes SQL to retrieve one entry from the CATEGORY 
 * table with an specific cat_id. It returns an object with a 
 * successful status code and the body of the object which is the 
 * result of the query (the retrieved row as an object) stringified 
 * into JSON format for the http response.
 *****************************************************************/
async function getCategory(c_id)
{
    let retrieved = [];

    await pool.query(`SELECT * FROM category WHERE cat_id=${c_id}`)
            .then((results) => retrieved = results.rows[0])
            .catch((error) => console.log(error));
            
    return createResponse(200, retrieved);
}


/*******************************************************************
 * Function that used SQL to insert an entry into the CATEGORY table. The
 * new item is received as parameter as an object that was JSON parsed.
 * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
 * (and expressions based on columns) that were modified by an insert, 
 * delete or update. It returns an object with a successful status 
 * code and the body of the object which is the result of the query (the 
 * retrieved row as an object) stringified into JSON format for the 
 * http response. 
********************************************************************/
async function addCategory(c)
{
    let addedCategory;

    await pool.query(
    `INSERT INTO category (
        NAME) VALUES ($1) RETURNING *`, 
           [c.name])
            .then((results) => addedCategory = results.rows[0])
            .catch((error) => console.log(error));

    return createResponse(200, addedCategory);
}

/*****************************************************************
 * Function that utilizes SQL to update one entry from the CATEGORY 
 * table with an specific cat_id. The new attributes of the entry
 * to be modified will be received as an object that was JSON parsed.
 * It returns an object with a successful status code and the body 
 * of the object which is the result of the query (the updated row as
 * an object) stringified into JSON format for the http response.
 *****************************************************************/
 async function updateCategory(c, c_id)
 {
    let updatedCategory;

    await pool.query(
        `UPDATE category SET 
            NAME = $1
            WHERE cat_id = $2 RETURNING *`,
            [c.name, c_id ])
            .then((results) => updatedCategory = results.rows[0])
            .catch((error) => console.log(error));

    return createResponse(200, updatedCategory);
 }
 
/*******************************************************************
 * Function that used SQL to delete an entry from the CATEGORY table. The
 * id of the book entry to delete is received as parameter.
 * The SQL statment utilizes the "RETURNING" which retrieves values of columns 
 * (and expressions based on columns) that were modified by an insert, 
 * delete or update. It returns an object with a successful status 
 * code and the body of the object which is the result of the query (the 
 * deleted row as an object) stringified into JSON format for the 
 * http response. 
********************************************************************/
async function deleteCategory(c_id)
{
   let deletedCategory;

   await pool.query('DELETE FROM category WHERE cat_id = $1 RETURNING *', [c_id])
           .then((results) => deletedCategory = results.rows[0])
           .catch((error) => console.log(error));

   return createResponse(200, deletedCategory);
}
