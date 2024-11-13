import { configDotenv } from 'dotenv'
import mysql from 'mysql2'

configDotenv();

export const connection = await mysql.createPool({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    enableKeepAlive: true
})


// "JUST CHECKING"
// connection.execute(
//     'desc users;', (err, res) => {
//         if (err) {
//             console.log("Error executing command!", err);
//         }else{
//             console.log("Successfull -> ", res);
//         }
//     }
// )

// connection.ping(()=>{
//     console.log("HELLO! from the database")
// })



/*
create table users(
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL, 
    user_id INT NOT NULL PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
)
*/
