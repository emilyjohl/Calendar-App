import { useEffect, useState } from 'react';
import superagent from 'superagent';
import { BookProps } from '../types/types.ts'
import './Book.css'


function Book ({ currentStudent, availableSlot }: BookProps) {
  
  const [booked, setBooked ] = useState(false)
  const [coachNum, setCoachNum] = useState(availableSlot.coach_num)

  useEffect(() => {
    if (availableSlot.type === 'booked')setBooked(true)
  })
  async function saveBooked (){
      try{
        superagent
          .post('/api/saveBooking')
          .send({
            slot: availableSlot,
            student: currentStudent
          })
          .set('accept', 'json')
          .end((err, response) => {
            if(err){
                console.log('error!')
            }else {
                console.log('returned', response.body)
                setCoachNum(response.body[0].phonenum)
                setBooked(true)            
            }
        })
    }catch{

    }
  }


  return (
    <div className='booked-container'>
    {booked ? (
      <div>
        <p>Coach Number: <br></br>{coachNum}</p>
      </div>
    ) : (
      <button id='book-me' onClick={() => saveBooked()}>Book me</button>
    )}
  </div>
  )
}

export default Book;
