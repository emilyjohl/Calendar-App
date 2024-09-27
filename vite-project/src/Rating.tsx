import { useEffect, useState } from 'react';
import './Rating.css'
import superagent from 'superagent';


type CurrentCoach = {
    coach_id: number; // Use lowercase 'number' instead of 'Number'
    firstname: string;
    lastname: string;
    phonenum: number;
    availableSlots: number[];
    previousSlots: number[];
};

type AvailableSlot = {
    title: string;
    start_time: Date;
    end_time: Date;
    bookedby: string;
    bookedfor: string;
    comments: string;
    rating: number;
  };
  

type RatingProps = {
    currentCoach: CurrentCoach; // Define props type
    availableSlot: AvailableSlot;
};

function Rating({ currentCoach, availableSlot }: RatingProps) {
    const [rated, setRated] = useState(false);
    const [rating, setRating] = useState(0); // Initialize the rating state
    const [comment, setComment] = useState(''); // Initialize the rating state
    const [fetchedRating, setFetchedRating] = useState(null);


    useEffect(() => {
        if(availableSlot.rating > 0){
            setRated(true)
            setRating(availableSlot.rating)
            setComment(availableSlot.comments)
        }

        console.log(rating)
    })  
    
    async function submitComment() {
        console.log('clicked', availableSlot)
        if(rating > 0){
            try{
                superagent
                  .post('/api/saveRating')
                  .send({
                    slot: availableSlot,
                    comment: comment,
                    rating: rating
                  })
                  .set('accept', 'json')
                  .end((err, res) => {
                    if(err){
                        console.log('error!')
                    }else {
                        console.log('returned', res)
                        setRated(true)
                    }
                })
            }catch{

            }
        }
    }



    // console.log('currentCoach', currentCoach, 'availableslot', availableSlot);

    return (
        <div>
            {rated ? (
                <div>Thank you for your rating!

                    <p>rated {rating}</p>
                    <p>{comment}</p>
                </div>
        //         <div className="rating">
        //     {[5, 4, 3, 2, 1].map((star) => (
        //         <span key={star}>
        //             <input
        //                 type="radio"
        //                 name="rating"
        //                 id={`star${star}`}
        //                 value={star}
        //                 checked={rating === star} // Ensure the radio is checked based on the rating
        //                 onChange={() => setRating(star)}
        //                 className="rating-input" // Hide the radio button
        //             />
        //             <label
        //                 htmlFor={`star${star}`}
        //                 title={`${star} stars`}
        //                 className={`rating-star ${rating >= star ? 'checked' : ''}`}
        //             >
        //                 <i className="fas fa-star"></i>
        //             </label>
        //         </span>
        //     ))}
        // </div>
            ) : (
                <div>
                    <div className="rating">
                    <input type="radio" name="rating" id="star5" value="5" onClick={() => setRating(5)} />
                    <label htmlFor="star5" title="5 stars">
                        <i className={`fas fa-star ${rating >= 5 ? 'checked' : ''}`}></i>
                    </label>

                    <input type="radio" name="rating" id="star4" value="4" onClick={() => setRating(4)} />
                    <label htmlFor="star4" title="4 stars">
                        <i className={`fas fa-star ${rating >= 4 ? 'checked' : ''}`}></i>
                    </label>

                    <input type="radio" name="rating" id="star3" value="3" onClick={() => setRating(3)} />
                    <label htmlFor="star3" title="3 stars">
                        <i className={`fas fa-star ${rating >= 3 ? 'checked' : ''}`}></i>
                    </label>

                    <input type="radio" name="rating" id="star2" value="2" onClick={() => setRating(2)} />
                    <label htmlFor="star2" title="2 stars">
                        <i className={`fas fa-star ${rating >= 2 ? 'checked' : ''}`}></i>
                    </label>

                    <input type="radio" name="rating" id="star1" value="1" onClick={() => setRating(1)} />
                    <label htmlFor="star1" title="1 star">
                        <i className={`fas fa-star ${rating >= 1 ? 'checked' : ''}`}></i>
                    </label>
                </div>

                    <div>
                        <input type="text" onChange={(e) => setComment(e.target.value)} />
                        <button onClick={() => submitComment()}>Submit Rating</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Rating;
