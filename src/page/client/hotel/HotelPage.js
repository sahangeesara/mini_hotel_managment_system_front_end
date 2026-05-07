import React, { useEffect, useMemo, useState } from "react";
import hotelService from "../../../service/HotelService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./hotel.css";
function HotelPage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 100000 });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [filters, setFilters] = useState({
    searchName: "",
    location: "",
    amenities: [],
    priceMin: 0,
    priceMax: 100000,
    starRating: "",
  });
  const AMENITIES_LIST = [
    "Free WiFi",
    "Pool",
    "Gym",
    "Restaurant",
    "Parking",
    "Airport Shuttle",
    "Air Conditioning",
    "Sea View",
  ];
  useEffect(() => {
    fetchHotels();
  }, []);
  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await hotelService.getAllHotels();
      const hotelArray = Array.isArray(data) ? data : [];
      setHotels(hotelArray);
      if (hotelArray.length > 0) {
        const prices = hotelArray
          .map((h) => Number(h.price_per_night) || 0)
          .filter((p) => p > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceBounds({ min: minPrice, max: maxPrice });
          setFilters((prev) => ({
            ...prev,
            priceMin: minPrice,
            priceMax: maxPrice,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };
  const getImageUrl = (hotel) => {
    const normalizeUrl = (value) => {
      if (!value) return null;
      const raw = String(value).trim();
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
      if (raw.startsWith("/storage/")) return `http://localhost:8000${raw}`;
      if (raw.startsWith("storage/")) return `http://localhost:8000/${raw}`;
      const cleaned = raw.replace(/^public\//i, "").replace(/^\//, "");
      return `http://localhost:8000/storage/${cleaned}`;
    };
    return normalizeUrl(hotel?.image_url) || normalizeUrl(hotel?.image) || "https://via.placeholder.com/800x500?text=Hotel+Image";
  };
  const getAmenities = (hotel) => {
    if (Array.isArray(hotel?.amenities)) return hotel.amenities;
    if (typeof hotel?.amenities === "string" && hotel.amenities.trim()) {
      return hotel.amenities.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };
  const starCount = (value) => {
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? Math.min(5, count) : 0;
  };
  const formatPrice = (value) => {
    const price = Number(value);
    return Number.isFinite(price) ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0.00";
  };
  const selectedAmenities = useMemo(() => getAmenities(selectedHotel || {}), [selectedHotel]);
  const uniqueLocations = useMemo(() => {
    const locations = new Set();
    hotels.forEach((hotel) => {
      if (hotel.city) locations.add(hotel.city);
    });
    return Array.from(locations).sort();
  }, [hotels]);
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      if (filters.searchName && !hotel.hotel_name?.toLowerCase().includes(filters.searchName.toLowerCase())) return false;
      if (filters.location && hotel.city !== filters.location) return false;
      if (filters.amenities.length > 0) {
        const hotelAmenities = getAmenities(hotel);
        const hasAllAmenities = filters.amenities.every((amenity) => hotelAmenities.includes(amenity));
        if (!hasAllAmenities) return false;
      }
      const price = Number(hotel.price_per_night) || 0;
      if (price < filters.priceMin || price > filters.priceMax) return false;
      if (filters.starRating && Number(hotel.star_rating) !== Number(filters.starRating)) return false;
      return true;
    });
  }, [hotels, filters]);
  const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHotels = filteredHotels.slice(startIndex, endIndex);
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
    }));
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setFilters({
      searchName: "",
      location: "",
      amenities: [],
      priceMin: priceBounds.min,
      priceMax: priceBounds.max,
      starRating: "",
    });
    setCurrentPage(1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };
  const handleView = (hotel) => {
    setSelectedHotel(hotel);
  };
  const handleEdit = (hotel) => {
    navigate("/admin/hotel", { state: { hotel } });
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
      setSelectedHotel((current) => (current?.id === id ? null : current));
      await fetchHotels();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Hotel deleted successfully",
        confirmButtonColor: "#3b62f6",
      });
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
    <div className="client-hotel-page">
      <div className="client-hotel-header">
        <div>
          <h2>Hotel List</h2>
          <p>Browse available hotels and review key details before booking.</p>
        </div>
        <span className="hotel-count-badge">{filteredHotels.length} / {hotels.length} Hotels</span>
      </div>
      <div className="hotel-container">
        <aside className="hotel-filter-sidebar">
          <div className="filter-header">
            <h3>Filters</h3>
            <button type="button" className="reset-filters-btn" onClick={resetFilters}>Reset</button>
          </div>
          <div className="filter-group">
            <label className="filter-label">Hotel Name</label>
            <input type="text" placeholder="Search hotels..." value={filters.searchName} onChange={(e) => handleFilterChange("searchName", e.target.value)} className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">Location</label>
            <select value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)} className="filter-select">
              <option value="">All Locations</option>
              {uniqueLocations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Amenities</label>
            <div className="amenities-filter">
              {AMENITIES_LIST.map((amenity) => (
                <label key={amenity} className="amenity-checkbox">
                  <input type="checkbox" checked={filters.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Price Range (LKR)</label>
            <div className="price-range">
              <div className="price-input-group">
                <label>Min</label>
                <input type="number" min="0" value={filters.priceMin} onChange={(e) => handleFilterChange("priceMin", Number(e.target.value))} className="filter-input" />
              </div>
              <div className="price-input-group">
                <label>Max</label>
                <input type="number" min="0" value={filters.priceMax} onChange={(e) => handleFilterChange("priceMax", Number(e.target.value))} className="filter-input" />
              </div>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Star Rating</label>
            <select value={filters.starRating} onChange={(e) => handleFilterChange("starRating", e.target.value)} className="filter-select">
              <option value="">All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </aside>
        <div className="hotel-main-content">
          {loading ? (
            <div className="client-hotel-state">Loading hotels...</div>
          ) : error ? (
            <div className="client-hotel-state error">{error}</div>
          ) : filteredHotels.length === 0 ? (
            <div className="client-hotel-state">{hotels.length === 0 ? "No hotels found" : "No hotels match your filters"}</div>
          ) : (
            <>
              <div className="hotel-grid">
                {paginatedHotels.map((hotel) => {
                  const amenities = getAmenities(hotel);
                  const stars = starCount(hotel.star_rating);
                  return (
                    <article className="hotel-card-client" key={hotel.id}>
                      <img src={getImageUrl(hotel)} alt={hotel.hotel_name || "Hotel image"} className="hotel-card-image" />
                      <div className="hotel-card-body">
                        <div className="hotel-card-top">
                          <h3 className="hotel-card-title">{hotel.hotel_name || "Unnamed Hotel"}</h3>
                          <div className="hotel-card-location">{hotel.city || "Location not available"}</div>
                        </div>
                        <div className="hotel-card-price">LKR {formatPrice(hotel.price_per_night)} / night</div>
                        <div className="hotel-card-rating" aria-label={`Rating ${stars} out of 5`}>
                          {"★".repeat(stars)}
                          {stars === 0 ? <span className="rating-empty">No rating</span> : null}
                        </div>
                        <div className="hotel-amenities">
                          {amenities.length > 0 ? (amenities.map((amenity, index) => (<span className="amenity-badge" key={`${amenity}-${index}`}>{amenity}</span>))) : (<span className="amenity-badge muted">No amenities listed</span>)}
                        </div>
                        <div className="hotel-card-actions">
                          <button type="button" className="btn-view" onClick={() => handleView(hotel)}>View</button>
                          <button type="button" className="btn-edit" onClick={() => handleEdit(hotel)}>Edit</button>
                          <button type="button" className="btn-delete" onClick={() => handleDelete(hotel.id)}>Delete</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {filteredHotels.length > ITEMS_PER_PAGE && (
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>← Previous</button>
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button key={pageNum} className={`pagination-number ${currentPage === pageNum ? "active" : ""}`} onClick={() => handlePageClick(pageNum)}>{pageNum}</button>
                    ))}
                  </div>
                  <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {selectedHotel ? (
        <div className="hotel-modal-overlay" onClick={() => setSelectedHotel(null)}>
          <div className="hotel-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="hotel-modal-close" onClick={() => setSelectedHotel(null)}>×</button>
            <img src={getImageUrl(selectedHotel)} alt={selectedHotel.hotel_name || "Hotel image"} className="hotel-modal-image" />
            <div className="hotel-modal-content">
              <h3>{selectedHotel.hotel_name || "Unnamed Hotel"}</h3>
              <p>{selectedHotel.city || "Location not available"}</p>
              <div className="hotel-modal-grid">
                <div>
                  <span className="hotel-modal-label">Price per night</span>
                  <span className="hotel-modal-value">LKR {formatPrice(selectedHotel.price_per_night)}</span>
                </div>
                <div>
                  <span className="hotel-modal-label">Star rating</span>
                  <span className="hotel-modal-value">{"★".repeat(starCount(selectedHotel.star_rating)) || "No rating"}</span>
                </div>
              </div>
              <div className="hotel-modal-section">
                <span className="hotel-modal-label">Amenities</span>
                <div className="hotel-amenities">
                  {selectedAmenities.length > 0 ? (selectedAmenities.map((amenity, index) => (<span className="amenity-badge" key={`${amenity}-${index}`}>{amenity}</span>))) : (<span className="amenity-badge muted">No amenities listed</span>)}
                </div>
              </div>
              <div className="hotel-modal-actions">
                <button type="button" className="btn-view" onClick={() => setSelectedHotel(null)}>Close</button>
                <button type="button" className="btn-edit" onClick={() => handleEdit(selectedHotel)}>Edit</button>
                <button type="button" className="btn-delete" onClick={() => handleDelete(selectedHotel.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default HotelPage;
