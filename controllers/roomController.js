import Room from "../models/room";
import Booking from "../models/booking";
import ErrorHandler from "../utils/errorHandler";
import asyncHandler from "../middlewares/asyncHandler";
import APIFeatures from "../utils/APIFeatures";
import cloudinary from "cloudinary";

//@desc get all rooms
//@route Get/api/rooms

export const allRooms = asyncHandler(async (req, res) => {
  const resPerpage = 4;
  const roomsCount = await Room.countDocuments();

  const apiFeatures = new APIFeatures(Room.find(), req.query).search().filter();

  let rooms = await apiFeatures.query;
  let filteredRoomsCount = rooms.length;

  apiFeatures.pagination(resPerpage);
  rooms = await apiFeatures.query;

  res.status(200).json({
    success: true,
    roomsCount,
    resPerpage,
    filteredRoomsCount,
    rooms,
  });
});

//@desc get single romm
//@route Get/api/rooms/:id
export const getSingleRoom = asyncHandler(async (req, res, next) => {
  const { id } = req.query;
  const room = await Room.findById(id);

  if (!room) {
    // res.status(400).json({
    //   success: false,
    //   error: 'No room found with this id',
    // })
    return next(new ErrorHandler("Room not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    room,
  });
});

//@desc Create new room
//@route Post/api/rooms

export const newRoom = asyncHandler(async (req, res) => {
  const images = req.body.images;
  let imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "bookit/rooms",
    });

    console.log(result);

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user._id;

  const room = await Room.create(req.body);
  res.status(201).json({ success: true, room });
});

//@desc update new room
//@route Put/api/rooms/id
export const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.query;

  let room = await Room.findById(id);
  if (!room) {
    res.status(400).json({
      success: false,
      error: "No room found with this id",
    });
  }

  if (req.body.images) {
    //Delete images associted with the room
    for (let i = 0; i < room.images.length; i++) {
      await cloudinary.v2.uploader.destroy(room.images[i].public_id);
    }

    let imagesLinks = [];

    for (let i = 0; i < req.body.images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(req.body.images[i], {
        folder: "bookit/rooms",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  room = await Room.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    isUpdated: true,
    room,
  });
});

//@desc Delete room
//@route Put/api/rooms/id
export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const room = await Room.findById(id);
  if (!room) {
    res.status(400).json({
      success: false,
      error: "No room found with this id",
    });
  }

  await room.remove();

  res.status(200).json({
    success: true,
    message: "Room is deleted",
  });
});

//@desc Create a new review
//@route Put/api/review
export const createRoomReview = asyncHandler(async (req, res) => {
  const { rating, comment, roomId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const room = await Room.findById(roomId);

  const isReviewed = room.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    room.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    room.reviews.push(review);
    room.numOfReviews = room.reviews.length;
  }

  room.ratings =
    room.reviews.reduce((acc, item) => item.rating + acc, 0) /
    room.reviews.length;
  await room.save({ validateBeforeSave: true });

  res.status(200).json({
    success: true,
  });
});

//@desc check review availability
//@route Get/api/reviews/check_review
export const checkReviewAvailability = asyncHandler(async (req, res) => {
  const { roomId } = req.query;

  const booking = await Booking.find({ user: req.user._id, room: roomId });

  let isReviewAvailable = false;
  if (booking.length > 0) isReviewAvailable = true;

  res.status(200).json({
    success: true,
    isReviewAvailable,
  });
});

//@desc Get All rooms
//@route Get/api/admin/rooms
export const allAdminRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find();

  res.status(200).json({
    success: true,
    rooms,
  });
});

//@desc Get All rooms reviews
//@route Get/api/reviews
export const allRoomsReviews = asyncHandler(async (req, res) => {
  const rooms = await Room.findById(req.query.id);
  let reviews = rooms.reviews;
  res.status(200).json({
    success: true,
    reviews,
  });
});
