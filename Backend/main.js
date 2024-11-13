import { connection } from "./db.js"

export const getData = (req, res) => {
    const user_id = req.user_id
    if(!user_id) return res.status(403).json("No user_id found")
    connection.execute(
        `select * from data where user_id=?`, [user_id], (err, result)=>{
            if(err) return res.status(400).json("Unable to get Data!")
            console.log(result);
        }
    )
}