const mysql = require('mysql2/promise');

// Connect to the MySQL database and initialize the tables
const initDB = async () => {
  console.log("sstarting db init")
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root_password',
    database: process.env.MYSQL_DATABASE || 'track_points_app'
  });

  // Create the `point_system` table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS point_system (
      id varchar(255) NOT NULL DEFAULT 'user-1',
      action_key varchar(255) NOT NULL,
      message varchar(255) DEFAULT NULL,
      points int DEFAULT NULL,
      PRIMARY KEY (id, action_key)
    )
  `);

  // Create the `targets` table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS targets (
      id varchar(255) NOT NULL DEFAULT 'user-1',
      action_key varchar(25) NOT NULL,
      target int DEFAULT NULL,
      PRIMARY KEY (id, action_key)
    )
  `);

  // Create the `total_action_points` table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS total_action_points (
      id varchar(255) NOT NULL DEFAULT 'user-1',
      action varchar(10) NOT NULL,
      total_points int DEFAULT NULL,
      PRIMARY KEY (id, action)
    )
  `);

  // Create the `track_points` table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS track_points (
      id varchar(255) NOT NULL DEFAULT 'user-1',
      day int NOT NULL,
      actions varchar(50) DEFAULT NULL,
      points_for_day int DEFAULT NULL,
      thoughts varchar(2000) DEFAULT NULL,
      PRIMARY KEY (id, day)
    )
  `);

  console.log("Tables created or already exist");
  await connection.end();
};

initDB().catch(console.error);
