import { NextFunction, Request, Response } from 'express';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

//connect to postgresql database
const connectionString = process.env.CONNECTIONSTRING
const client = new Client({connectionString : connectionString});
client.connect().catch(err => console.error('Connection error', err.stack));


const controller = {

    bypassAuth: async function (req: Request, res: Response, next: NextFunction){
        try {
            const coachesQuery = 'SELECT * FROM coaches'; 
            const studentsQuery = 'SELECT * FROM students';
            const coaches = await client.query(coachesQuery);
            const students = await client.query(studentsQuery);
            const result = {
                coaches: coaches.rows,
                students: students.rows
            }
            res.locals.rows = (result); 
            next()
        } catch (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    loadCoachData: async function (req: Request, res: Response, next: NextFunction){
        try{
            const { coach } = req.body
            const query = `
                SELECT availableslots
                FROM coaches
                WHERE coach_id = $1;
            `;
            const values = [coach.coach_id];
            
            const result = await client.query(query, values);
            
            if (result.rows.length > 0) {
                const availableSlots = result.rows[0].availableslots;
                if (availableSlots.length > 0) {
                    const slotQuery = `
                      
                        SELECT slots.*, students.phoneNum
                        FROM slots
                        LEFT JOIN students ON slots.bookedBy = students.student_id
                        WHERE slot_id = ANY($1);
                    `;
                    const slotValues = [availableSlots];
            
                    const slotResult = await client.query(slotQuery, slotValues);
                    res.locals.slots = slotResult.rows
                    next()
                } else {
                    res.locals.slots = 0
                    next()
                }
            } else {
              res.locals.slots = 0
              next()
            }              
        }catch(err){
          console.error('Error executing query', err.stack);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    loadStudentData: async function (req: Request, res: Response, next: NextFunction){
        try{
            //return all available slots, will sort old in the frontend
            const { student } = req.body
            const queryEmptySlots = `
                SELECT *
                FROM slots
                WHERE bookedBy IS NULL;
            `;
            const emptySlots = await client.query(queryEmptySlots);
            const queryBookedSlots = `
                SELECT slots.*, coaches.phoneNum
                FROM slots
                JOIN coaches ON slots.bookedFor = coaches.coach_id
                WHERE slots.bookedBy = $1;
            `;
            const values = [student.student_id];
            const bookedSlots = await client.query(queryBookedSlots, values);

            if (emptySlots.rows.length <= 0) {
                const result = {
                    availableSlots: 0,
                    bookedSlots: bookedSlots.rows
                }
                res.locals.slots = result
                next()
            }else {
                //need to find the coach info for availableSlots and send it back
                const result = {
                    availableSlots: emptySlots.rows,
                    bookedSlots: bookedSlots.rows
                }
                res.locals.slots = result
                next()
            }           
        }catch(err){
          console.error('Error executing query', err.stack);
          res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    saveAvailableSlot: async function (req: Request, res: Response, next: NextFunction){
        try{
            const { coach, slot } = req.body
            const insertQuery = `
                INSERT INTO slots (start_time, end_time, title, bookedFor)
                VALUES ($1, $2, $3, $4)
                RETURNING slot_id;
            `;
            const insertValues = [slot.start_time, slot.end_time, slot.title, coach.coach_id];
            const insertResult = await client.query(insertQuery, insertValues);
            const inserted_id = insertResult.rows[0].slot_id; // Get the new slot ID
        
            const updateQuery = `
                UPDATE coaches
                SET availableslots = availableslots || $1
                WHERE coach_id = $2;
            `;
            const updateValues = [[inserted_id], coach.coach_id];
            await client.query(updateQuery, updateValues);
            await client.query('COMMIT');
            res.locals.sucess = true
            next()
        }catch(err){
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' }); 
        }
    },

    saveRating: async function (req: Request, res: Response, next: NextFunction){
        try{
            const { slot, comment, rating } = req.body
            const updateSlotQuery = `
                UPDATE slots
                SET comments = $1, rating = $2
                WHERE slot_id = $3
            `
            const updateValues = [comment, rating, slot.slot_id];
            await client.query(updateSlotQuery, updateValues);
            res.locals.sucess = true
            next()
        }catch(err){
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' }); 
        }
    },

    saveBooking: async function (req: Request, res: Response, next: NextFunction){
        try{
            const { slot, student } = req.body
            const updateSlotQuery = `
                WITH updated_slot AS (
                    UPDATE slots
                    SET bookedBy = $1
                    WHERE slot_id = $2
                    RETURNING bookedfor
                )
                SELECT coaches.phonenum
                FROM updated_slot
                JOIN coaches ON updated_slot.bookedfor = coaches.coach_id;
            `
            const updateValues = [student.student_id, slot.slot_id];
            const result = await client.query(updateSlotQuery, updateValues);
            

            res.locals.result = result.rows
            next()
        }catch(err){
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' }); 
        }
    },


}

export default controller;