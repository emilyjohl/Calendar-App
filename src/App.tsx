import './App.css';
import Dropdown from 'react-bootstrap/Dropdown';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment-timezone';
import { useEffect, useState } from 'react';
import Book from './Book.tsx'
import Rating from './Rating.tsx';
import superagent from 'superagent';
import { DropdownItem } from 'react-bootstrap';
import { isPast } from 'date-fns';
import { Student, Coach, AvailableSlot, Selectable } from '../types/types.ts'


const localizer = momentLocalizer(moment);


function App() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [eventInfo, setEventInfo] = useState<Selectable | null>(null);
  const [userNames, setUserNames] = useState<Coach[] | Student[]>()
  const [currentUser, setCurrentUser] = useState<Coach | Student>()

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
            alert('An error occured')
          }else {
            const data = res.body;
            const { coaches, students } = data;
            setUserNames(coaches.concat(students))
          }
        });
    }catch{
      alert('An error occured')
    }
  }

  async function loadCurrentUser(selectedUser: Coach | Student) {
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
              alert('An error occured')
            }else {
              const slots = res.body;
              setAvailableSlots(prevSlots => [...prevSlots, ...slots.map(slot => ({
                title: slot.title,
                start_time: new Date(slot.start_time),
                end_time: new Date(slot.end_time),
                bookedby: slot.bookedby,
                bookedfor: slot.bookedfor,
                comments: slot.comments,
                rating: slot.rating,
                slot_id: slot.slot_id,
                type: slot.bookedby ? 'booked' : 'available', 
                coach_num: selectedUser.phonenum,
                student_num: slot.phonenum
              }))]);
              if (!slots.length) {
                  alert('Add available slots by clicking the calendar');
              }
            }
          });
      }catch{
        alert('An error occured')
      }
    }else{
      try{
        superagent
          .post('/api/loadStudentData')
          .send({
            student: selectedUser
          })
          .set('accept', 'json')
          .end((err, res) => {
            if(err){
              alert('An error occured')
            }else {
              const { availableSlots, bookedSlots } = res.body;
              if (!availableSlots.length) {
                alert('No available slots from coaches');
                return
            }
         
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
                setAvailableSlots(prevSlots => [...prevSlots, ...bookedSlots.map(slot => ({
                  title: slot.title,
                  start_time: new Date(slot.start_time),
                  end_time: new Date(slot.end_time),
                  bookedby: slot.bookedby,
                  bookedfor: slot.bookedfor,
                  comments: slot.comments,
                  rating: slot.rating,
                  slot_id: slot.slot_id,
                  type: 'booked',
                  coach_num: slot.phonenum,
                  student_num: selectedUser.phonenum
                }))]);
              }
            }
          });
      }catch{
        alert('An error occured')
      }
    }
  }

   const handleSelectSlot = ({ start }: { start: Date;  }) => {
      const start_time = start;
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
    if (!eventInfo) return;
    if (!currentUser) return;

    const newSlot: AvailableSlot = {
      title: `${currentUser.firstname} Availabile`,
      start_time: eventInfo.start_time, 
      end_time: eventInfo.end_time,    
      bookedby: null,
      bookedfor: null,
      comments: '',
      rating: 0,
      slot_id: null,
      type: 'available',
      coach_num: currentUser.phonenum,
      student_num: null
    };

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
            alert('There has been an error')
          }else {
            if(res){
              setAvailableSlots(prevSlots => [...prevSlots, newSlot]);
              setShowPopup(false); 
              return;
            }else {
              alert('There has been an error')
            };
          }
        })
    }
    catch{
      alert('There has been an error')
    }
  };


  return (
    <div className='app-container'>
      <div>
        <Dropdown className='dropdown' >
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
              Select A User to Start
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
                      <DropdownItem onClick={() => loadCurrentUser(element)} key={index}>Student: {element.firstname}</DropdownItem>
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
              event: (eventProps: Event) => {

                const { event } = eventProps; 
                const eventStartTime = new Date(event.start_time); 

                return isPast(eventStartTime) || event.type === 'booked'? (
                    <Rating availableSlot={event} {...eventProps} /> 
                ) : (
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
                event: (eventProps) => {
                  const { event } = eventProps; 
                  const eventStartTime = new Date(event.start_time); 
                  return isPast(eventStartTime) ? (
                      <></>
                      ) : (
                      <Book currentStudent={currentUser} {...eventProps} availableSlot={event} />
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
