const { Pool, Client } = require('pg')
const pool = new Pool({
    user: 'sergiomdl77',
    host: 'book-store-bd-instance.canbliboxxf8.us-east-1.rds.amazonaws.com',
    database: 'book_store_db',
    password: 'Guate1996!',
    port: 5432
})

exports.handler = async (event) => {
    // TODO implement
    pool.connect();
    let data = [];
    
    await pool.query('SELECT * FROM book')
            .then((res) => data = res.rows)
            .catch((err) => console.log(err));
            
    return {
            statusCode: 200,
            body: JSON.stringify(data)
    }
};
