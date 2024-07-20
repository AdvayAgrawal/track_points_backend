import { ResultSetHeader } from "mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "track_points_app"
});


export async function SelectQuery<T>(query:string, params?: any[]): Promise<T[]>{
    const [results] = await pool.execute(query, params);
    return results as T[];
}

export async function ModifyQuery(query:string, params?: any[]): Promise<ResultSetHeader>{
    const [results] = await pool.execute(query, params);
    return results as ResultSetHeader;
}

