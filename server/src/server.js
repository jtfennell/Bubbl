var express    = require('express');
var dotenv     = require('dotenv');
var morgan     = require('morgan');
var bodyParser = require('body-parser')
var app        = express();

dotenv.load();

app.use(morgan(process.env.LOGGING_LEVEL? process.env.LOGGING_LEVEL:'combined'));
app.listen(process.env.API_PORT);

app.get('/', (req,res) => {
	res.send('Hello World');
});

console.log(`listening on port ${process.env.API_PORT}`);