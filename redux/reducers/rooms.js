import {
  GET_ALL_ROOMS,
  ROOMS_ERROR,
  GET_ROOM_DETAILS,
  NEW_REVIEW_SUCCESS,
  NEW_REVIEW_FAIL,
  NEW_REVIEW_RESET,
  REVIEW_AVAILABILITY_SUCCESS,
  REVIEW_AVAILABILITY_FAIL,
  ADMIN_ROOM_SUCCESS,
  ADMIN_ROOM_FAIL,
  CREATE_ROOM_SUCCESS,
  CREATE_ROOM_FAIL,
  CLEAR_ERROR,
  UPDATE_ROOM_SUCCESS,
  UPDATE_ROOM_RESET,
  UPDATE_ROOM_FAIL,
  SET_LOADING_NEW,
  DELETE_ROOM_FAIL,
  DELETE_ROOM_SUCCESS,
  RESET_DELETED_ROOM,
  RESET_CREATE_ROOM,
  GET_ALL_REVIEWS_SUCCESS,
  GET_ALL_REVIEWS_FAIL,
} from "../types/type";

const initialState = {
  rooms: [],
  room: null,
  loading: true,
  error: null,
  review: null,
  reviewAvailable: null,
};

export const rooms = (state = initialState, action) => {
  const { payload, type } = action;
  switch (type) {
    case GET_ALL_ROOMS:
      return {
        ...state,
        roomsCount: payload.roomsCount,
        resPerpage: payload.resPerpage,
        filteredRoomsCount: payload.filteredRoomsCount,
        rooms: payload.rooms,
        loading: false,
      };

    case ADMIN_ROOM_SUCCESS:
      return {
        ...state,
        rooms: payload.rooms,
        loading: false,
      };

    case ADMIN_ROOM_FAIL:
    case ROOMS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };

    default:
      return {
        ...state,
      };
  }
};

//Create room
export const newRoom = (
  state = { room: {}, loading: null, error: null },
  action
) => {
  const { payload, type } = action;
  switch (type) {
    case CREATE_ROOM_SUCCESS:
      return {
        ...state,
        success: payload.success,
        room: payload.room,
        loading: false,
      };
    case RESET_CREATE_ROOM:
      return {
        ...state,
        success: false,
      };
    case CREATE_ROOM_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
      };

    case SET_LOADING_NEW:
      return {
        ...state,
        loading: true,
      };
    default:
      return {
        ...state,
      };
  }
};

//Create room
export const updateRoom = (
  state = { isUpdated: null, loading: null, error: null },
  action
) => {
  const { payload, type } = action;
  switch (type) {
    case UPDATE_ROOM_SUCCESS:
      return {
        ...state,
        isUpdated: payload,
        loading: false,
      };

    case UPDATE_ROOM_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
      };

    case UPDATE_ROOM_RESET:
      return {
        ...state,
        isUpdated: false,
        loading: false,
      };

    case SET_LOADING_NEW:
      return {
        ...state,
        loading: true,
      };
    default:
      return {
        ...state,
      };
  }
};

//Get Room Details
export const roomDetails = (state = initialState, action) => {
  const { payload, type } = action;
  switch (type) {
    case GET_ROOM_DETAILS:
      return {
        ...state,
        room: payload,
        loading: false,
      };
    case NEW_REVIEW_SUCCESS:
      return {
        ...state,
        review: payload,
        loading: false,
      };

    case REVIEW_AVAILABILITY_SUCCESS:
      return {
        ...state,
        reviewAvailable: payload,
        loading: false,
      };

    case NEW_REVIEW_RESET:
      return {
        ...state,
        review: false,
        loading: false,
      };

    case REVIEW_AVAILABILITY_FAIL:
    case CLEAR_ERROR:
    case NEW_REVIEW_FAIL:
    case ROOMS_ERROR: {
      return {
        ...state,
        error: payload,
        loading: false,
      };
    }

    default:
      return {
        ...state,
      };
  }
};

const deleteInitialState = {
  loading: null,
  success: false,
  message: null,
  error: null,
};
//Delete a room
export const deleteRoom = (state = deleteInitialState, action) => {
  const { payload, type } = action;
  switch (type) {
    case DELETE_ROOM_SUCCESS:
      return {
        ...state,
        success: payload.success,
        message: payload.message,
        loading: false,
      };

    case DELETE_ROOM_FAIL: {
      return {
        ...state,
        error: payload,
        loading: false,
      };
    }

    case RESET_DELETED_ROOM:
      return {
        ...state,
        success: false,
        message: null,
      };

    default:
      return {
        ...state,
      };
  }
};

const initialReviewState = {
  loading: false,
  success: false,
  reviews: null,
  error: null,
};

//Delete a room
export const getReviews = (state = initialReviewState, action) => {
  const { payload, type } = action;
  switch (type) {
    case GET_ALL_REVIEWS_SUCCESS:
      return {
        ...state,
        success: payload.success,
        reviews: payload.reviews,
        loading: false,
      };

    case GET_ALL_REVIEWS_FAIL: {
      return {
        ...state,
        error: payload,
        loading: false,
      };
    }

    // case RESET_DELETED_ROOM:
    //   return {
    //     ...state,
    //     success: false,
    //     message: null,
    //   };

    default:
      return {
        ...state,
      };
  }
};
