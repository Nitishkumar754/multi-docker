const keys = require('./keys');

//Express App Setup

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postgres Client Setup

const {Pool} = require('pg');
console.log("keys>>>>>>> ",keys);


const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	database: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort
})

// async function testConnect() {
//     console.log('Before connect>>>>>>>>>>>>>>>>');
//     const client = await pgClient.connect();
//     console.log('Connected!>>>>>>>>>>>>>', client);
//     client.release();
// }

// async function main() {
//     await testConnect();
    
// }
// main()
//     .then (() => {
//         console.error('Done>>>>>>>>>>>>>');
//         process.exit(0);
//     })
//     .catch((err) => {
//         console.error('Error>>>>>>>>>: %s', err);
//         console.error('Error>>>>>>>>>>>>>: %s', err.stack);
//         process.exit(1);
//     });

// main();


// console.log("pgClient>>>>>>>>>>>> ",pgClient);

pgClient.on('error', ()=> console.log('Lost PG connection>>>>>>>>>>>>>>>>>'));

// pgClient.query('SELECT NOW()', (err, res) => {
//   console.log(">>>>>>>>>>>>>>>> ",err, res)
//   // pool.end()
// })


pgClient
.query('CREATE TABLE IF NOT EXISTS values(number INT)')
.catch(err => console.log(err));

// Redis Client Setup

const redis = require('redis');
const redisClient = redis.createClient({
	host:keys.redisHost,
	port:keys.redisPort,
	retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();
console.log

//EXPRESS rout handler
app.get('/', (req, res)=>{
	res.send('Hi');
});

app.get('/values/all', async (req, res)=>{
	const values = await  pgClient.query('SELECT * FROM values');
	
	res.send(values.rows);
});

app.get('/values/current', async (req, res)=> {
	redisClient.hgetall('values', (err, values)=>{
		res.send(values);
	});
});

app.post('/values', async(req, res)=>{
	const index  = req.body.index;
	if(parseInt(index) > 40){
		return res.status(422).send('Index too high');
	}
	redisClient.hset('values', index, 'Nothing yet!');
	redisPublisher.publish('insert', index);
	var data = await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
	res.send({working:data});
});

app.listen(5000, err=>{
	console.log("listening on 5000");
})


