const API_URL = "http://localhost:8000/api/hotels";

class HotelService {

  // GET ALL HOTELS
  async getAllHotels() {
    const response = await fetch(API_URL);
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch hotels");
    }

    return response.json();
  }

  // CREATE HOTEL
  async createHotel(formData) {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      throw error;
    }

    return response.json();
  }

  // UPDATE HOTEL
  async updateHotel(id, formData) {
    formData.append("_method", "PUT");

    const response = await fetch(`${API_URL}/${id}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      throw error;
    }

    return response.json();
  }

  // DELETE HOTEL
  async deleteHotel(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    return response.json();
  }
}

const hotelService = new HotelService();

export default hotelService;