import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/hotel";

class HotelService {
    getAllHotels() {
        return axios.get(API_URL).then((res) => res.data.data || res.data);
    }

    createHotel(data) {
        return axios.post(API_URL, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    updateHotel(id, data) {
        return axios.post(`${API_URL}/${id}?_method=PUT`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    deleteHotel(id) {
        return axios.delete(`${API_URL}/${id}`);
    }

    // FILTER SEARCH API
    searchHotels(filters) {
        return axios
            .get(API_URL, {
                params: {
                    hotel_name: filters.searchName || "",
                    location: filters.location || "",
                    amenity: filters.amenities || [],
                    min_price: filters.priceMin || "",
                    max_price: filters.priceMax || "",
                    rating: filters.starRating || "",
                },
            })
            .then((res) => res.data.data || []);
    }
}

const hotelService = new HotelService();
export default hotelService;
