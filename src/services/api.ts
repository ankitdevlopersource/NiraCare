const API_BASE_URL = '/api';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      
      // If we get the "Starting Server" HTML page, it's a transient state
      if (contentType && contentType.includes('text/html')) {
        const text = await response.clone().text();
        if (text.includes('Starting Server') || text.includes('Please wait while your application starts')) {
          console.warn(`Server is still starting (attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Fetch failed (attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
}

export const api = {
  async login(credentials: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error(`Server is not ready or returned an invalid response. Please wait a few seconds and try again.`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async forgotPassword(email: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      const fullMessage = error.error ? `${error.message}. ${error.error}` : (error.message || 'Failed to process request');
      throw new Error(fullMessage);
    }
    return response.json();
  },

  async resetPassword(email: string, newPassword: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
    return response.json();
  },

  async register(userData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error(`Server is not ready or returned an invalid response. Please wait a few seconds and try again.`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  async createBooking(bookingData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Booking failed');
    }
    return response.json();
  },

  async getBookings() {
    const response = await fetchWithRetry(`${API_BASE_URL}/bookings`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return response.json();
  },

  async getBookingsByUser(userId: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/bookings/user/${userId}`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch user bookings');
    }
    return response.json();
  },

  async updateBookingStatus(id: string, status: string, additionalData: any = {}) {
    const response = await fetchWithRetry(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...additionalData }),
    });
    if (!response.ok) {
      throw new Error('Failed to update booking status');
    }
    return response.json();
  },

  // Ambulance Bookings
  async createAmbulanceBooking(bookingData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/ambulance-bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create ambulance booking');
    }
    return response.json();
  },

  async getAmbulanceBookings() {
    const response = await fetchWithRetry(`${API_BASE_URL}/ambulance-bookings`, { method: 'GET' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch ambulance bookings');
    }
    return response.json();
  },

  async getAmbulanceBookingById(id: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/ambulance-bookings/${id}`, { method: 'GET' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch ambulance booking');
    }
    return response.json();
  },

  async getAmbulanceBookingStatus(id: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/ambulance-bookings/${id}`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch ambulance booking status');
    }
    return response.json();
  },

  async updateAmbulanceBookingStatus(id: string, status: string, additionalData: any = {}) {
    const response = await fetchWithRetry(`${API_BASE_URL}/ambulance-bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...additionalData }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update ambulance booking status');
    }
    return response.json();
  },

  async getUsers() {
    const response = await fetchWithRetry(`${API_BASE_URL}/users`, { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  async approveUser(id: string, isApproved: boolean) {
    const response = await fetchWithRetry(`${API_BASE_URL}/users/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update approval status');
    }
    return response.json();
  },
  
  async updateUser(id: string, userData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    return response.json();
  },
  
  async getCurrentUser() {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser.id) return null;
    
    const allUsers = await this.getUsers();
    return allUsers.find((u: any) => u._id === storedUser.id) || null;
  },

  // HMS API Methods
  async getHospitalStats(hospitalId: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/hospitals/${hospitalId}/stats`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch hospital stats');
    return response.json();
  },

  async getDoctors(hospitalId: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/hospitals/${hospitalId}/doctors`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  },

  async createDoctor(doctorData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData),
    });
    if (!response.ok) throw new Error('Failed to create doctor');
    return response.json();
  },

  async getInventory(hospitalId: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/hospitals/${hospitalId}/inventory`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  async addInventory(itemData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error('Failed to add inventory');
    return response.json();
  },

  async getExpenses(hospitalId: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/hospitals/${hospitalId}/expenses`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  },

  async addExpense(expenseData: any) {
    const response = await fetchWithRetry(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) throw new Error('Failed to add expense');
    return response.json();
  },

  async getFeedback(hospitalId: string) {
    const response = await fetchWithRetry(`${API_BASE_URL}/hospitals/${hospitalId}/feedback`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  }
};
