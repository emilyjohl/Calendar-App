import express, { Request, Response } from 'express';
import controller from './controller.ts';

//boilerplate to set up express server
const app = express();
const port = 3000;
app.use(express.json())

app.get('/', (req: Request, res: Response ) => {
    res.send('Hello World')
})

app.get('/api/bypassAuth', controller.bypassAuth, (req: Request, res: Response ) => {
    res.status(200).send(res.locals.rows)
})

app.post('/api/saveAvailableSlot', controller.saveAvailableSlot, (req: Request, res: Response ) => {
    res.status(201).send(res.locals.sucess)
})

app.post('/api/loadCoachData', controller.loadCoachData, (req: Request, res: Response ) => {
    res.status(201).send(res.locals.slots)
})

app.post('/api/saveRating', controller.saveRating, (req: Request, res: Response ) => {
    res.status(201).send(res.locals.sucess)
})

app.post('/api/saveBooking', controller.saveBooking, (req: Request, res: Response ) => {
    res.status(201).send(res.locals.result)
})

app.post('/api/loadStudentData', controller.loadStudentData, (req: Request, res: Response ) => {
    res.status(201).send(res.locals.slots)
})

// start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
