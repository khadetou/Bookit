import nc from "next-connect";
import connectDB from "../../../../config/dbConnect";
import {
  allAdminRooms,
  deleteRoom,
} from "../../../../controllers/roomController";
import { isAuthenticated, authorizeRoles } from "../../../../middlewares/auth";
import onError from "../../../../middlewares/errors";

const handler = nc({ onError });

connectDB();

handler
  .use(isAuthenticated, authorizeRoles("admin"))
  .get(allAdminRooms)
  .delete(deleteRoom);

export default handler;
