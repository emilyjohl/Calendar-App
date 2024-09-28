export type AvailableSlot = {
    title: string;
    start_time: Date;
    end_time: Date;
    bookedby: number | null;
    bookedfor: number | null;
    comments: string;
    rating: number;
    slot_id: null | number;
    type: 'available' | 'booked';
    coach_num: number | null;
    student_num: number | null;
  };
  
export type Selectable = {
    start_time: Date;
    end_time: Date;
  };
  
export type Coach = {
    coach_id: Number;
    firstname: string;
    lastname: string;
    phonenum: number;
    availableSlots: number[];
    previousSlots: number[]
  };
  
export type Student = {
    student_id: Number;
    firstname: string;
    lastName: string;
    phonenum: number;
    upcomingSlots: number[];
    previousSlots: number[]
  };


export type CurrentUser = {
    coach_id: number; 
    firstname: string;
    lastname: string;
    phonenum: number;
    availableSlots: number[];
  };
  
export type BookProps = {
    currentStudent: CurrentUser;
    availableSlot: AvailableSlot
  }

export type RatingProps = {
    availableSlot: AvailableSlot;
};