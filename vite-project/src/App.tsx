import './App.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Book from './Book.tsx'

const localizer = momentLocalizer(moment);

type Event = {
  title: string;
  start: Date;
  end: Date;
  booked: boolean;
};

type Selectable = {
  start: Date;
  end: Date;
};

function App() {
  const [availableDates, setAvailableDates] = useState<Event[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [eventInfo, setEventInfo] = useState<Selectable | null>(null);
  const [coachName, setCoachName] = useState<string>('')
  const [coachNum, setCoachNum] = useState<string>('')

  useEffect(() => {
    // fetch here to grab coach / student name, availability / booked slots, and phone number
    setCoachName('Coach Sue')
    setCoachNum('129-345-1983')
  })

  const handleSelectSlot = ({ start }: Selectable) => {
    const end = moment(start).add(2, 'hours').toDate();
    setEventInfo({ start, end });
    setShowPopup(true); 
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleCreateEvent = () => {
    if (!eventInfo) return; 
    const newEvent: Event = {
      title: `${coachName} Availabile`,
      start: eventInfo.start, 
      end: eventInfo.end,     
      booked: false
    };

    // Log the new event to check its structure
    console.log('New Event:', newEvent);

    setAvailableDates([...availableDates, newEvent]);
    setShowPopup(false); // Close the popup after creating the event
  };


  const BookWrapper: React.FC<{ coachNum: string }> = ({ coachNum }) => {
    return <Book coachNum={coachNum} />;
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={availableDates}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '600px', width: "900px" }}
        defaultView='week'
        selectable
        onSelectSlot={handleSelectSlot}
        min={new Date(0, 0, 0, 9, 0)} 
        max={new Date(0, 0, 0, 19, 0)}
        components={{
          event: (eventProps) => <BookWrapper coachNum={coachNum} {...eventProps} />,
        }}
      />
      {showPopup && eventInfo && (
        <div className="popup">
          <h2>Create Event</h2>
          <p>
            Start: {moment(eventInfo.start).format('MMM Do YYYY h:mm A')}<br />
            End: {moment(eventInfo.end).format('MMM Do YYYY h:mm A')}
          </p>
          <button onClick={handleCreateEvent}>Create Event</button>
          <button onClick={handleClosePopup}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;
