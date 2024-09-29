import { useEffect, useState } from 'react';
import './Rating.css'
import superagent from 'superagent';
import { RatingProps } from '../types/types';


function Rating({ availableSlot }: RatingProps) {
    const [rated, setRated] = useState(false);
    const [booked, setBooked] = useState(false);
    const [studentNum] = useState(availableSlot.student_num)

    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState(''); 
    const [showRatingPopup, setShowRatingPopup] = useState(false);

    useEffect(() => {
        if(availableSlot.type === 'booked')setBooked(true)
        if(availableSlot.rating > 0){
            setRated(true)
            setRating(availableSlot.rating)
            setComments(availableSlot.comments)
        }
    },[])  
    
    async function submitComment() {        
        if(rating <= 0 && showRatingPopup){
            alert('Please select a rating first')
        }else if(rating > 0){
            try{
                superagent
                  .post('/api/saveRating')
                  .send({
                    slot: availableSlot,
                    comment: comments,
                    rating: rating
                  })
                  .set('accept', 'json')
                  .end((err, res) => {
                    if(err){
                      alert('An error occured')
                      setShowRatingPopup(false)
                    }else {
                      if(res.body === true){
                        setRated(true)
                        setShowRatingPopup(false)
                      }else return
                    }
                })
            }catch{
              alert('An error occured')
            }
        }
    }
    
    return (
        <div className='rating-container'>
            {booked ? (
                <p>Booked By {studentNum}</p>
            ) : rated ? (
                <div>
                    Rated:
                    <div className="rating">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <span key={star}>
                                <label
                                    htmlFor={`star${star}`}
                                    className={`rating-star ${rating >= star ? 'checked' : ''}`}
                                >
                                    <i className="fas fa-star"></i>
                                </label>
                            </span>
                        ))}
                    </div>
                    <button  onClick={() => setShowRatingPopup(true)}>View Comment</button>
                    {showRatingPopup ?
                    <div className='rating-popup'>
                        <div className='rating-popup-content'>
                            <p>{comments}</p>
                            <div className='button-container'>
                                <button onClick={() => setShowRatingPopup(false)}>Cancel</button>
                            </div>

                        </div>
                    </div>
                    :
                    <></>
                    }
                </div>
            ) : (
                <div>
                    <div className="rating">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <span key={star}>
                                <input
                                    type="radio"
                                    name="rating"
                                    id={`star${star}`}
                                    value={star}
                                    checked={rating === star}
                                    onChange={() => setRating(star)}
                                    className="rating-input" 
                                />
                                <label
                                    htmlFor={`star${star}`}
                                    title={`${star} stars`}
                                    className={`rating-star ${rating >= star ? 'checked' : ''}`}
                                >
                                    <i className="fas fa-star"></i>
                                </label>
                            </span>
                        ))}
                    </div>
                    <button onClick={() => setShowRatingPopup(true)}>Add Comments</button>
                    {showRatingPopup ?
                    <div className='rating-popup'>
                        <div className='rating-popup-content'>
                            <textarea className='big-textbox' onChange={(e) => setComments(e.target.value)} />
                            <div className='button-container'>
                                <button onClick={() => submitComment()}>Submit Rating</button>
                                <button onClick={() => setShowRatingPopup(false)}>Cancel</button>

                            </div>

                        </div>
                    </div>
                    :
                    <></>
                    }
                    
                </div>
            )}
        </div>
    );
    
}

export default Rating;
