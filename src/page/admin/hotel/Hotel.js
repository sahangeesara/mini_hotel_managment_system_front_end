import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import hotelService from "../../../service/HotelService";
import Swal from "sweetalert2";
import "./hotel.css";

const AMENITIES = [
  "Free WiFi",
  "Pool",
  "Gym",
  "Restaurant",
  "Parking",
  "Airport Shuttle",
  "Air Conditioning",
  "Sea View",
];

const EMPTY_FORM = {
  hotel_name: "",
  location: "",
  city: "",
  country: "",
  price_per_night: "",
  star_rating: "",
  amenities: [],
  description: "",
  image: null,
};

function Hotel() {
  const location = useLocation();
  const [hotelList, setHotelList] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ADMIN_ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchHotels();
  }, []);

  const getImageUrl = (hotelImage) => {
    if (!hotelImage) return "https://via.placeholder.com/120x120?text=No+Image";

    const raw = String(hotelImage).trim();
    if (!raw) return "https://via.placeholder.com/120x120?text=No+Image";

    if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    if (raw.startsWith("/storage/")) return `http://localhost:8000${raw}`;
    if (raw.startsWith("storage/")) return `http://localhost:8000/${raw}`;

    const cleaned = raw.replace(/^public\//i, "").replace(/^\//, "");
    return `http://localhost:8000/storage/${cleaned}`;
  };

  useEffect(() => {
    const hotel = location.state?.hotel;

    if (!hotel) return;

    setEditingId(hotel.id);
    setForm({
      hotel_name: hotel.hotel_name || "",
      location: hotel.location || "",
      city: hotel.city || "",
      country: hotel.country || "",
      price_per_night: hotel.price_per_night || "",
      star_rating: hotel.star_rating || "",
      amenities: hotel.amenities || [],
      description: hotel.description || "",
      image: null,
    });

    if (hotel.image_url) {
      setPreview(getImageUrl(hotel.image_url));
    } else if (hotel.image) {
      setPreview(getImageUrl(hotel.image));
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.state]);

  const fetchHotels = async () => {
    try {
      setLoading(true);

      const data = await hotelService.getAllHotels();

      setHotelList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Load failed",
        text: "Failed to load hotels",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenity);

      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setForm((prev) => ({
        ...prev,
        image: file,
      }));

      setPreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPreview(null);
  };

  // Calculate paginated hotels for table
  const totalPages = Math.ceil(hotelList.length / ADMIN_ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADMIN_ITEMS_PER_PAGE;
  const endIndex = startIndex + ADMIN_ITEMS_PER_PAGE;
  const paginatedHotelList = hotelList.slice(startIndex, endIndex);

  const handleAdminPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleAdminNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAdminPageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("hotel_name", form.hotel_name);
      formData.append("location", form.location);
      formData.append("city", form.city);
      formData.append("country", form.country);
      formData.append("price_per_night", form.price_per_night);
      formData.append("star_rating", form.star_rating);
      formData.append("description", form.description);

      form.amenities.forEach((item, index) => {
        formData.append(`amenities[${index}]`, item);
      });

        if (form.image) {
            formData.append("image", form.image);
        }

      if (editingId) {
        await hotelService.updateHotel(editingId, formData);

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Hotel updated successfully",
          confirmButtonColor: "#3b62f6",
        });
      } else {
        await hotelService.createHotel(formData);

        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Hotel created successfully",
          confirmButtonColor: "#3b62f6",
        });
      }

      clearForm();

      fetchHotels();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Operation failed",
        text: "Please try again",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotel) => {
    setEditingId(hotel.id);

    setForm({
      hotel_name: hotel.hotel_name || "",
      location: hotel.location || "",
      city: hotel.city || "",
      country: hotel.country || "",
      price_per_night: hotel.price_per_night || "",
      star_rating: hotel.star_rating || "",
      amenities: hotel.amenities || [],
      description: hotel.description || "",
      image: null,
    });

    if (hotel.image_url || hotel.image) {
      setPreview(getImageUrl(hotel.image_url || hotel.image));
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Delete hotel?",
        text: "This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
      });

      if (!result.isConfirmed) return;

      await hotelService.deleteHotel(id);

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Hotel deleted successfully",
        confirmButtonColor: "#3b62f6",
      });

      fetchHotels();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Unable to delete the hotel",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="hotel-page">
      <div className="hotel-header">
        <h2>Hotel Management</h2>

        <span className="hotel-count">
          {hotelList.length} Hotels
        </span>
      </div>

      <div className="hotel-card">
        <div className="hotel-card-header">

          <div>
            <div className="card-title">
              {editingId ? "Update Hotel" : "Add New Hotel"}
            </div>

            <div className="card-subtitle">
              Manage hotel information
            </div>
          </div>

          <span
            className={`mode-tag ${
              editingId ? "edit" : "create"
            }`}
          >
            {editingId ? "Edit Mode" : "Create Mode"}
          </span>
        </div>
             <br />
        <form
          className="hotel-form-body"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label className="form-label-sm">
              Hotel Name
            </label>

            <input
              type="text"
              name="hotel_name"
              className="hotel-input"
              value={form.hotel_name}
              onChange={handleChange}
              required
            />
          </div>
             <br />
          <div className="form-group">
            <label className="form-label-sm">
              Location
            </label>

            <input
              type="text"
              name="location"
              className="hotel-input"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
             <br />
          <div className="form-row">
            <div className="form-group">
              <label className="form-label-sm">
                City
              </label>

              <input
                type="text"
                name="city"
                className="hotel-input"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
             <br />
            <div className="form-group">
              <label className="form-label-sm">
                Country
              </label>

              <input
                type="text"
                name="country"
                className="hotel-input"
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
             <br />
          <div className="form-row">
            <div className="form-group">
              <label className="form-label-sm">
                Price Per Night
              </label>

              <input
                type="number"
                name="price_per_night"
                className="hotel-input"
                value={form.price_per_night}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
             <br />
            <div className="form-group">
              <label className="form-label-sm">
                Star Rating
              </label>

              <select
                name="star_rating"
                className="hotel-input hotel-select"
                value={form.star_rating}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Rating
                </option>

                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>
             <br />
          <div className="form-group">
            <label className="form-label-sm">
              Amenities
            </label>

            <div className="amenities-grid">
              {AMENITIES.map((item) => (
                <label
                  key={item}
                  className="amenity-item"
                >
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(item)}
                    onChange={() =>
                      handleAmenityChange(item)
                    }
                  />

                  {item +"      "} 
                </label>
              ))}
            </div>
          </div>

            <br />
          <div className="form-group">
            <label className="form-label-sm">
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              className="hotel-input"
              value={form.description}
              onChange={handleChange}
            />
          </div>
            <br />

          <div className="form-group">
            <label className="form-label-sm">
              Hotel Image
            </label>

            <input
              type="file"
              className="hotel-input"
              accept="image/*"
              onChange={handleImageChange}
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="hotel-avatar"
                style={{
                  width: "120px",
                  height: "120px",
                  marginTop: "10px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={
                editingId
                  ? "btn-update"
                  : "btn-save"
              }
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : editingId
                ? "Update Hotel"
                : "Save Hotel"}
            </button>

            <button
              type="button"
              className="btn-clear"
              onClick={clearForm}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="hotel-card">
        <div className="hotel-card-header">
       
          <div>
            <div className="card-title">
              Hotel List
            </div>

            <div className="card-subtitle">
              All registered hotels
            </div>
          </div>
        </div>

        <div className="hotel-table-wrap">
          <table className="hotel-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Image</th>
                <th>Name</th>
                <th>Location</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Amenities</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">
                    Loading hotels...
                  </td>
                </tr>
              ) : hotelList.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    No hotels found
                  </td>
                </tr>
              ) : (
                paginatedHotelList.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>{hotel.hotel_code}</td>

                   <td>
                        {hotel.image_url || hotel.image ? (
                            <img
                            src={getImageUrl(hotel.image_url || hotel.image)}
                            alt={hotel.hotel_name}
                            className="hotel-avatar"
                            style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                            }}
                            />
                        ) : (
                            "No Image"
                        )}
                        </td>

                    <td>
                      {hotel.hotel_name}
                    </td>

                    <td>
                      {hotel.city},{" "}
                      {hotel.country}
                    </td>

                    <td>
                      LKR{" "}
                      {Number(
                        hotel.price_per_night
                      ).toLocaleString()}
                    </td>

                    <td>
                      {"⭐".repeat(
                        hotel.star_rating
                      )}
                    </td>

                    <td>
                      {hotel.amenities?.join(
                        ", "
                      )}
                    </td>

                    <td>
                      <div className="action-group">
                        <button
                          className="action-btn edit-btn"
                          onClick={() =>
                            handleEdit(hotel)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() =>
                            handleDelete(
                              hotel.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hotelList.length > ADMIN_ITEMS_PER_PAGE && (
          <div className="admin-pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={handleAdminPreviousPage} 
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handleAdminPageClick(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button 
              className="pagination-btn" 
              onClick={handleAdminNextPage} 
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Hotel;
