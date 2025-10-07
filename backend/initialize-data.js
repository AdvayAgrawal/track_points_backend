const mysql = require('mysql2/promise');
const fs = require('fs').promises; // Use the promises API for fs
const path = require('path');

const initializeData = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root_password',
      database: process.env.MYSQL_DATABASE || 'track_points_app'
    });

    // Read data from data.json
    const jsonFilePath = '/data.json'
    const fileData = await fs.readFile(jsonFilePath, 'utf-8');
    const jsonData = JSON.parse(fileData);
    console.log(jsonData)

    // Check if there is already data in the point_system table
    const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM point_system`);
    if (rows[0].count > 0) {
      console.log("Data already exists in point_system table. Skipping initialization.");
      await connection.end();
      return;
    }

    // Insert data into the point_system table
    if (jsonData.point_system && jsonData.point_system.length > 0) {
      for (const action of jsonData.point_system) {
        await connection.execute(
          `INSERT INTO point_system (action_key, message, points) VALUES (?, ?, ?)`,
          [action.action_key, action.message, action.points]
        );
        console.log(action.action_key, action.message, action.points)
      }
      console.log("Inserted data into point_system table.");
    } else {
      console.log("No data found in point_system to insert.");
    }

    // Insert data into the targets table
    if (jsonData.targets && jsonData.targets.length > 0) {
      for (const target of jsonData.targets) {
        await connection.execute(
          `INSERT INTO targets (action_key, target) VALUES (?, ?)`,
          [target.action_key, target.target]
        );
      }
      console.log("Inserted data into targets table.");
    } else {
      console.log("No data found in targets to insert.");
    }

    console.log("Data initialization complete");
    await connection.end();
  } catch (err) {
    console.error('Error initializing data:', err);
  }
};

initializeData();
