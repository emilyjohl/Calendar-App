import { useState } from 'react';



type BookProps = {
  coachNum: string; // Ensure the prop is defined in the interface
}
function Book ({ coachNum }: BookProps) {
  
  const [booked, setBooked ] = useState(false)

  console.log(coachNum)

  return (
    <div>
    {booked ? (
      <div>Booked!
        <button onClick={() => setBooked(false)}>Cancel</button>
        <p>{coachNum}</p>
      </div>
    ) : (
      <button onClick={() => setBooked(true)}>Book me</button>
    )}
  </div>
  )
}

export default Book;
