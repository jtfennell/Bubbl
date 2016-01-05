var express = require('express');
var dotenv  = require('dotenv');
var morgan  = require('morgan');
var app     = express();

dotenv.load();

app.use(morgan(process.env.LOGGING_LEVEL));
app.listen(process.env.API_PORT);

app.get('/', (req,res) => {
	res.send('Hello World');
});

console.log(`listening on port ${process.env.API_PORT}`);