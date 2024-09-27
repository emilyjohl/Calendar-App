import './App.css';
import Dropdown from 'react-bootstrap/Dropdown';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Book from './Book.tsx'
import Rating from './Rating.tsx';
import superagent from 'superagent';
import { DropdownItem } from 'react-bootstrap';
import { isPast } from 'date-fns';

const localizer = momentLocalizer(moment);

type AvailableSlot = {
  title: string;
  start_time: Date;
  end_time: Date;
  bookedby: string;
  bookedfor: string;
  comments: string;
  rating: number;
  slot_id: null | number;
  type: 'available' | 'booked';
};

type Selectable = {
  start_time: Date;
  end_time: Date;
};

type Coach = {
  coach_id: Number;
  firstname: string;
  lastname: string;
  phonenum: number;
  availableSlots: number[];
  previousSlots: number[]
};

type Student = {
  student_id: Number;
  firstname: string;
  lastName: string;
  phonenum: number;
  upcomingSlots: number[];
  previousSlots: number[]
};

function App() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [eventInfo, setEventInfo] = useState<Selectable | null>(null);
  const [userNames, setUserNames] = useState<Coach[] | Student[]>()
  // const [studentNames, setStudentNames] = useState<string>('')

  const [currentUser, setCurrentUser] = useState<Coach | Student>()
  const [coachNum, setCoachNum] = useState<number>()

  useEffect(() => {
    bypassAuthentication() 
  }, [])

  async function bypassAuthentication() {
    try{
      superagent
        .get('/api/bypassAuth')
        .set('accept', 'json')
        .end((err, res) => {
          if(err){
            console.log('error!')
          }else {
            const data = res.body;
            console.log(data);
            const { coaches, students } = data;
            console.log(coaches, )
            setUserNames(coaches.concat(students))
          }
        });
    }catch{
      console.log('error')
    }
  }

  async function loadCurrentUser(selectedUser: Coach | Student) {
    console.log('inside loadCurrentUser', selectedUser)
    setAvailableSlots([])
    setCurrentUser(selectedUser);

    if('coach_id' in selectedUser){
      try{
        superagent
          .post('/api/loadCoachData')
          .send({
            coach: selectedUser
          })
          .set('accept', 'json')
          .end((err, res) => {
            if(err){
              console.log('error!')
            }else {
              const slots = res.body;
              //need to add handling for viewing the phone num
              setAvailableSlots(prevSlots => [...prevSlots, ...slots.map(slot => ({
                title: slot.title,
                start_time: new Date(slot.start_time),
                end_time: new Date(slot.end_time),
                bookedby: slot.bookedby,
                bookedfor: slot.bookedfor,
                comments: slot.comments,
                rating: slot.rating,
                slot_id: slot.slot_id,
                type: 'available'
              }))]);

              setCoachNum(selectedUser.phonenum);
              if (!slots.length) {
                  alert('Add available slots by clicking the calendar');
              }
            }
          });
      }catch{
        console.log('error')
      }
    }else{
      console.log('inside student')
      try{
        superagent
          .post('/api/loadStudentData')
          .send({
            student: selectedUser
          })
          .set('accept', 'json')
          .end((err, res) => {
            if(err){
              console.log('error!')
            }else {
              const { availableSlots, bookedSlots } = res.body;
              
              console.log('returned', availableSlots, bookedSlots)
              // setCoachNum(availableSlots.phonenum)
              // delete availableSlots.phonenum
         
              setAvailableSlots(prevSlots => [...prevSlots, ...availableSlots.map(slot => ({
                title: slot.title,
                start_time: new Date(slot.start_time),
                end_time: new Date(slot.end_time),
                bookedby: slot.bookedby,
                bookedfor: slot.bookedfor,
                comments: slot.comments,
                rating: slot.rating,
                slot_id: slot.slot_id,
                type: 'available'
              }))]);

              if(bookedSlots.length > 0){

              }

              // setCoachNum(selectedUser.phonenum);
              // if (!slots.length) {
              //     alert('Add available slots by clicking the calendar');
              // }
            }
          });
      }catch{
        console.log('error')
      }
    }
  }


  // const handleSelectSlot = ({ start_time }: Selectable) => {
   const handleSelectSlot = ({ start }: { start: Date;  }) => {
      const start_time = start; // Rename to start_time
      // const end_time = end;     // You can also rename this if you want
      console.log('select slot', start_time)
      //error handlign for creating new availabilities too soon
      const now = moment(); 
      const selectedStart = moment(start_time);
        if (selectedStart.isSame(now, 'day') || selectedStart.isBefore(now)) {
        alert("You cannot create an event today or in the past.");
        return;
      }
      const end_time = moment(start_time).add(2, 'hours').toDate();
      setEventInfo({ start_time, end_time });
      setShowPopup(true); 
  };

  async function createAvailableSlot() {
    console.log('create AVailable Slot called', eventInfo, currentUser)
    if (!eventInfo) return;
    if (!currentUser) return;

    const newSlot: AvailableSlot = {
      title: `${currentUser.firstname} Availabile`,
      start_time: eventInfo.start_time, 
      end_time: eventInfo.end_time,     
      bookedby: '',
      bookedfor: '',
      comments: '',
      rating: 0,
      slot_id: null,
      type: 'available'
    };

    console.log('New Event:', newSlot);
    try{
      superagent
        .post('/api/saveAvailableSlot')
        .send({
          coach: currentUser,
          slot: newSlot
        })
        .set('accept', 'json')
        .end((err, res) => {
          if(err){
            console.log('error!')
          }else {
            console.log('back, now set to state', res)
            //type available?
            setAvailableSlots(prevSlots => [...prevSlots, newSlot]);
            console.log('current user', currentUser)
            setCoachNum(currentUser.phonenum)
            setShowPopup(false); 
          }
        })
    }
    catch{
      console.log('unable to create slot')
    }
  };


  return (
    <div>
      <div>
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Dropdown Button
            </Dropdown.Toggle>

            <Dropdown.Menu>
            {userNames ? (
                userNames.map((element: Coach | Student, index) => {
                  if ('coach_id' in element) {
                    return (
                      <DropdownItem onClick={() => loadCurrentUser(element)} key={index}>Coach: {element.firstname}</DropdownItem>
                    );
                  } else {
                    return (
                      <DropdownItem onClick={() => loadCurrentUser(element)} key={index}>Coach: {element.firstname}</DropdownItem>
                      // <DropdownItem key={index}>Student: {element.firstname}</DropdownItem>
                    );
                  }
                })
              ) : (
                <></>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {currentUser && 'coach_id' in currentUser ?
          <Calendar
            localizer={localizer}
            events={availableSlots}
            startAccessor="start_time"
            endAccessor="end_time"
            style={{ height: '600px', width: "900px" }}
            defaultView='week'
            selectable
            onSelectSlot={handleSelectSlot}
            min={new Date(0, 0, 0, 9, 0)} 
            max={new Date(0, 0, 0, 19, 0)}
            components={{
              // event: (eventProps) => 

              
              //   <BookWrapper coachNum={coachNum} {...eventProps} 
              // />,
              event: (eventProps) => {
                const { event } = eventProps; // Extract the event from eventProps
                const eventStartTime = new Date(event.start_time); // Convert to Date if not already

                return isPast(eventStartTime) && event.type =='booked' ? (
                    // get phone num here somehow
                    <Rating currentCoach={currentUser} availableSlot={event} {...eventProps} /> // Replace with your past event component
                ) : (
                    // <Book coachNum={coachNum} {...eventProps} />
                    <></>
                );
            },
            }}
          />
        :
          <Calendar
              localizer={localizer}
              events={availableSlots}
              startAccessor="start_time"
              endAccessor="end_time"
              style={{ height: '600px', width: "900px" }}
              defaultView='week'
              selectable
              onSelectSlot={handleSelectSlot}
              min={new Date(0, 0, 0, 9, 0)} 
              max={new Date(0, 0, 0, 19, 0)}
              components={{
                // event: (eventProps) => 

                
                //   <BookWrapper coachNum={coachNum} {...eventProps} 
                // />,
                event: (eventProps) => {
                  const { event } = eventProps; // Extract the event from eventProps
                  const eventStartTime = new Date(event.start_time); // Convert to Date if not already

                  return isPast(eventStartTime) ? (
                      // <Rating currentCoach={currentUser} availableSlot={event} {...eventProps} /> // Replace with your past event component
                      <></>
                      ) : (
                      <Book coachNum={coachNum} {...eventProps} />
                  );
              },
              }}
            />
        }
      {showPopup && eventInfo && (
        <div className="popup">
          <h2>Create Available Slot</h2>
          <p>
            Start: {moment(eventInfo.start_time).format('MMM Do YYYY h:mm A')}<br />
            End: {moment(eventInfo.end_time).format('MMM Do YYYY h:mm A')}
          </p>
          <button onClick={() => createAvailableSlot()}>Create Event</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default App;
