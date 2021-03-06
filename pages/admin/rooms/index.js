import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Loader from "../../../components/Loader";
import { MDBDataTable } from "mdbreact";
import { toast } from "react-toastify";
import { getAdminRooms, deleteRoom } from "../../../redux/actions/rooms";
import { getSession } from "next-auth/client";
import { RESET_DELETED_ROOM } from "../../../redux/types/type";

export default function AdminRooms() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, rooms } = useSelector((state) => state.allRooms);
  const {
    loading: dltLoading,
    error: dltError,
    success,
    message,
  } = useSelector((state) => state.deleteRoom);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (dltError) {
      toast.error(dltError);
    }
    if (success) {
      toast.success(message);
      dispatch({ type: RESET_DELETED_ROOM });
    }
    dispatch(getAdminRooms());
  }, [dispatch, success]);

  const deleteRooms = (id) => {
    if (window.confirm("Are you sure you want to delete this room!")) {
      dispatch(deleteRoom(id));
    }
  };

  const setRooms = () => {
    const data = {
      columns: [
        {
          label: "Room ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Name",
          field: "name",
          sort: "asc",
        },
        {
          label: "Price / Night",
          field: "price",
          sort: "asc",
        },
        {
          label: "Category",
          field: "category",
          sort: "asc",
        },
        {
          label: "Actions",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    };

    rooms &&
      rooms.forEach((room) => {
        data.rows.push({
          id: room._id,
          name: room.name,
          price: `$${room.pricePerNight}`,
          category: room.category,
          actions: (
            <>
              <Link href={`/admin/rooms/${room._id}`}>
                <a className="btn btn-primary mr-2">
                  <i className="fa fa-pencil"></i>
                </a>
              </Link>

              <button
                className="btn btn-danger"
                onClick={() => deleteRooms(room._id)}
              >
                <i className="fa fa-trash"></i>
              </button>
            </>
          ),
        });
      });
    return data;
  };

  return (
    <div className="container container-fluid">
      {loading ? (
        <Loader />
      ) : (
        <>
          <h1 className="my-5">
            {`${rooms && rooms.length} Rooms`}{" "}
            <Link href="/admin/rooms/new">
              <a className="mt-0 btn text-white float-right new-room-btn ">
                Create Room
              </a>
            </Link>
          </h1>

          <MDBDataTable
            data={setRooms()}
            className="px-3"
            bordered
            striped
            hover
          />
        </>
      )}
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  if (!session || session.user.avatar.role !== "admin") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
