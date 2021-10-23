const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await next();
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = {issue: [{error: err.message || 'Unexpected error'}]};
        ctx.response.status = 500;
    }
});

class Car {
    constructor({id, model, price, date, available}) {
        this.id = id;
        this.model = model;
        this.price = price;
        this.date = date;
        this.available = available;
    }
}

const cars = [];
for (let i = 0; i < 3; i++) {
    cars.push(new Car({
        id: `${i}`,
        model: `car ${i}`,
        price: 100,
        date: new Date(Date.now() + i),
        available: true
    }));
}
let lastUpdated = cars[cars.length - 1].date;
let lastId = cars[cars.length - 1].id;
const pageSize = 10;

const broadcast = data =>
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/car', ctx => {
    const ifModifiedSince = ctx.request.get('If-Modified-Since');
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
        ctx.response.status = 304; // NOT MODIFIED
        return;
    }
    const model = ctx.request.query.model;
    const page = parseInt(ctx.request.query.page) || 1;
    ctx.response.set('Last-Modified', lastUpdated.toUTCString());
    const sortedCars = cars
        .filter(car => model ? car.model.indexOf(model) !== -1 : true)
        .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
    const offset = (page - 1) * pageSize;
    // ctx.response.body = {
    //   page,
    //   stocks: sortedStocks.slice(offset, offset + pageSize),
    //   more: offset + pageSize < sortedStocks.length
    // };
    ctx.response.body = cars;
    ctx.response.status = 200;
});

router.get('/car/:id', async (ctx) => {
    const carId = ctx.request.params.id;
    const car = cars.find(c => carId === c.id);
    if (car) {
        ctx.response.body = car;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = {issue: [{warning: `car with id ${carId} not found`}]};
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createCar = async (ctx) => {
    const car = ctx.request.body;
    if (!car.model) { // validation
        ctx.response.body = {issue: [{error: 'Name is missing'}]};
        ctx.response.status = 400; //  BAD REQUEST
        return;
    }
    car.id = `${parseInt(lastId) + 1}`;
    lastId = car.id;
    car.date = new Date();
    car.available = true;
    cars.push(car);
    ctx.response.body = car;
    ctx.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {car: car}});
};

router.post('/car', async (ctx) => {
    await createCar(ctx);
});

router.put('/car/:id', async (ctx) => {
    const id = ctx.params.id;
    const car = ctx.request.body;
    car.date = new Date();
    const carId = car.id;
    if (carId && id !== car.id) {
        ctx.response.body = {issue: [{error: `Param id and body id should be the same`}]};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    if (!carId) {
        await createCar(ctx);
        return;
    }
    const index = cars.findIndex(car => car.id === id);
    if (index === -1) {
        ctx.response.body = {issue: [{error: `car with id ${id} not found`}]};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    cars[index] = car;
    lastUpdated = new Date();
    ctx.response.body = car;
    ctx.response.status = 200; // OK
    broadcast({event: 'updated', payload: {car: car}});
});

router.del('/car/:id', ctx => {
    const id = ctx.params.id;
    const index = cars.findIndex(car => id === car.id);
    if (index !== -1) {
        const car = cars[index];
        cars.splice(index, 1);
        lastUpdated = new Date();
        broadcast({event: 'deleted', payload: {car: car}});
    }
    ctx.response.status = 204; // no content
});

setInterval(() => {
    lastUpdated = new Date();
    lastId = `${parseInt(lastId) + 1}`;
    const car = new Car({id: lastId, model: `car ${lastId}`, price: 100, date: lastUpdated, available: true});
    cars.push(car);
    console.log(`${car.model}`);
    broadcast({event: 'created', payload: {car}});
}, 150000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
