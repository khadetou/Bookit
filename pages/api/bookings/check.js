import nc from "next-connect";
import connectDB from "../../../config/dbConnect";
import { checkBookingRoomAvailability } from "../../../controllers/bookingController";

import onError from "../../../middlewares/errors";

const handler = nc({ onError });

connectDB();

handler.get(checkBookingRoomAvailability);

export default handler;
