const http = require("http");
const app = require("./src/app");
const db = require("./src/app/models");

const server = http.createServer(app);
var env = process.env.NODE_ENV || 'development';
var config = require('./src/app/config/config.json')[env]
const PORT = config.PORT;

 
db.sequelize.sync({ alter: false }) // Use { force: true } only during development to drop and recreate tables
  .then(() => {
    console.log("Database synced successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });


