import { useState } from "react";
import { useRouter } from "next/router";
export default function Search() {
  const [location, setLocation] = useState("");
  const [guest, setGuest] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  const sumbitHandler = (e) => {
    e.preventDefault();
    if (location.trim()) {
      router.push(`/?location=${location}&guest=${guest}&category=${category}`);
    } else {
      router.push("/");
    }
  };
  return (
    <div className="container container-fluid">
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={sumbitHandler}>
            <h2 className="mb-3">Search Rooms</h2>
            <div className="form-group">
              <label htmlFor="location_field">Location</label>
              <input
                type="text"
                className="form-control"
                id="location_field"
                placeholder="new york"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="guest_field">No. of Guests</label>
              <select
                className="form-control"
                id="guest_field"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
              >
                {[...Array(6).keys()].map((num, idx) => (
                  <option key={idx} value={num + 1}>
                    {num + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="room_type_field">Room Type</label>
              <select
                className="form-control"
                id="room_type_field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {["King", "Single", "Twins"].map((category, idx) => (
                  <option key={idx} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-block py-2">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
