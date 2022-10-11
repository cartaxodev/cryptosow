const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then( con => {
    //console.log(con.connections);
    console.log('DB connection successful!');
})

//START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listenning port ${port}...`);
});