import { getRoomDetails } from "../../redux/actions/rooms";
import { useState, useEffect } from "react";
import { wrapper } from "../../redux/store";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Carousel } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";
import { checkBooking, getBookedDates } from "../../redux/actions/booking";
import { CHECK_BOOKING_RESET } from "../../redux/types/type";
import getStripe from "../../utils/getStripe";
import { toast } from "react-toastify";
import NewReview from "../../components/NewReview";
import ListReviews from "../../components/ListReviews";

export default function RoomDetails() {
  const dispatch = useDispatch();
  const {
    room: {
      address,
      airConditioned,
      breakfast,
      description,
      guestCapacity,
      images,
      internet,
      name,
      numOfBeds,
      numOfReviews,
      petsAllowed,
      pricePerNight,
      ratings,
      roomCleaning,
      reviews,
    },
  } = useSelector((state) => state.room);

  const { loading, available, error, dates } = useSelector(
    (state) => state.booking
  );
  const { user } = useSelector((state) => state.auth);

  const [checkInDate, setCheckInDate] = useState();
  const [checkOutDate, setCheckOutDate] = useState();
  const [daysOfStay, setDaysOfStay] = useState();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    dispatch(getBookedDates(id));
    return () => {
      dispatch({ type: CHECK_BOOKING_RESET });
    };
  }, [dispatch, id]);

  const excludedDates = [];

  if (dates) {
    dates.forEach((date) => {
      excludedDates.push(new Date(date));
    });
  }

  const onChange = (dates) => {
    const [checkInDate, checkOutDate] = dates;

    setCheckInDate(checkInDate);

    setCheckOutDate(checkOutDate);

    if (checkInDate && checkOutDate) {
      //Calculate days of stay
      const days = Math.floor(
        (new Date(checkOutDate) - new Date(checkInDate)) / 86400000 + 1
      );
      setDaysOfStay(days);

      dispatch(
        checkBooking(id, checkInDate.toISOString(), checkOutDate.toISOString())
      );
    }
  };

  const newBookingHandler = async () => {
    const bookingData = {
      room: router.query.id,
      checkInDate,
      checkOutDate,
      daysOfStay,
      amountPaid: 90,
      paymentInfo: {
        id: "STRIPE_PAYMENT_ID",
        status: "STRIPE_PAYMENT_STATUS",
      },
      paidAt: Date.now(),
    };

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post("/api/bookings", bookingData, config);
    } catch (error) {
      console.log(error.response);
    }
  };

  const bookRoom = async (id, pricePerNight) => {
    setPaymentLoading(true);
    const amount = pricePerNight * daysOfStay;
    try {
      const link = `/api/checkout_session/${id}?checkInDate=${checkInDate.toISOString()}&checkoutDate=${checkOutDate.toISOString()}&daysOfStay=${daysOfStay}`;

      const { data } = await axios.get(link, { params: { amount } });
      const stripe = await getStripe();

      //Redirect to checkout

      stripe.redirectToCheckout({ sessionId: data.id });

      setPaymentLoading(false);
    } catch (error) {
      setPaymentLoading(false);
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="container container-fluid">
      <h2 className="mt-5">{name}</h2>
      <p>{address}</p>
      <div className="ratings mt-auto mb-3">
        <div className="rating-outer">
          <div
            className="rating-inner"
            style={{ width: `${(ratings / 5) * 100}%` }}
          ></div>
        </div>
        <span id="no_of_reviews">{`(${numOfReviews} Reviews)`}</span>
      </div>
      <Carousel hover="pause">
        {images &&
          images.map((image) => (
            <div
              key={image.public_id}
              style={{ width: "100%", height: "440px" }}
            >
              <Image src={image.url} alt={name} layout="fill" />
            </div>
          ))}
      </Carousel>

      <div className="row my-5">
        <div className="col-12 col-md-6 col-lg-8">
          <h3>Description</h3>
          <p>{description}</p>

          <div className="features mt-5">
            <h3 className="mb-4">Features:</h3>
            <div className="room-feature">
              <i className="fa fa-cog fa-fw fa-users" aria-hidden="true"></i>
              <p>{guestCapacity} Guests</p>
            </div>

            <div className="room-feature">
              <i className="fa fa-cog fa-fw fa-bed" aria-hidden="true"></i>
              <p>{numOfBeds} Beds</p>
            </div>

            <div className="room-feature">
              <i className="fa fa-cog fa-fw fa-bath" aria-hidden="true"></i>
              <p>2 Baths</p>
            </div>

            <div className="room-feature">
              <i
                className={
                  breakfast
                    ? "fa fa-check text-success"
                    : "fa fa-times text-danger"
                }
                aria-hidden="true"
              ></i>
              <p>Breakfast</p>
            </div>

            <div className="room-feature">
              <i
                className={
                  internet
                    ? "fa fa-check text-success"
                    : "fa fa-times text-danger"
                }
                aria-hidden="true"
              ></i>
              <p>Internet</p>
            </div>

            <div className="room-feature">
              <i
                className={
                  airConditioned
                    ? "fa fa-check text-success"
                    : "fa fa-times text-danger"
                }
                aria-hidden="true"
              ></i>
              <p>Air Conditioned</p>
            </div>

            <div className="room-feature">
              <i
                className={
                  petsAllowed
                    ? "fa fa-check text-success"
                    : "fa fa-times text-danger"
                }
                aria-hidden="true"
              ></i>
              <p>Pets Allowed</p>
            </div>

            <div className="room-feature">
              <i
                className={
                  roomCleaning
                    ? "fa fa-check text-success"
                    : "fa fa-times text-danger"
                }
                aria-hidden="true"
              ></i>
              <p>Room Cleaning</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="booking-card shadow-lg p-4">
            <p className="price-per-night">
              <b>${pricePerNight}</b> / night
            </p>
            <hr />

            <p className="mt-5 mb-3">Pick Check In & Check Out Date</p>

            <DatePicker
              className="w-100"
              selected={checkInDate}
              onChange={onChange}
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={new Date()}
              excludeDates={excludedDates}
              selectsRange
              inline
            />

            {available === true && (
              <div className="alert alert-success my-3 font-weight-bold">
                Room is available. Book now
              </div>
            )}
            {available === false && (
              <div className="alert alert-danger my-3 font-weight-bold">
                Room is not available. Try different dates
              </div>
            )}
            {available && !user && (
              <div className="alert alert-danger my-3 font-weight-bold">
                Log in To book a room.
              </div>
            )}

            {available && user && (
              <button
                className="btn btn-block py-3 booking-btn"
                onClick={() => bookRoom(id, pricePerNight)}
                disabled={loading || paymentLoading ? true : false}
              >
                Pay - ${daysOfStay * pricePerNight}
              </button>
            )}
          </div>
        </div>
      </div>
      <NewReview />
      {reviews && reviews.length > 0 ? (
        <ListReviews reviews={reviews} />
      ) : (
        <p>
          <b>No reviews on this room</b>{" "}
        </p>
      )}
    </div>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, params }) => {
      await store.dispatch(getRoomDetails(req, params.id));
    }
);
