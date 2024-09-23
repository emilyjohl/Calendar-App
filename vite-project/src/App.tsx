// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';

import moment from 'moment'

const localizer = momentLocalizer(moment)
const myEventsList = [
  {
    title: 'Event 1',
    start: new Date(2024, 8, 30, 10, 0), // October 30, 2024, 10:00 AM
    end: new Date(2024, 8, 30, 12, 0),   // October 30, 2024, 12:00 PM
  },
  {
    title: 'Event 2',
    start: new Date(2024, 8, 31, 14, 0), // October 31, 2024, 2:00 PM
    end: new Date(2024, 8, 31, 15, 0),   // October 31, 2024, 3:00 PM
  },
];

function App() {
  


return (
  <div style={{height: '800px'}}>
    <Calendar
      localizer={localizer}
      events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '500px' }}
    />
  </div>
)
}

export default App
