// 📁 src/util/RentcarAPI.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:6001";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE,
});

// 요청 인터셉터: 항상 최신 액세스토큰을 헤더에 붙임
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 만료된 토큰 자동 갱신 + 401 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    // 네트워크 오류나 다른 에러라면 그냥 reject
    if (!response) {
      return Promise.reject(error);
    }

    // 1) 토큰 만료된 경우 (백엔드에서 code: "TOKEN_EXPIRED"로 응답)
    if (
      response.status === 401 &&
      response.data?.code === "TOKEN_EXPIRED" &&
      !config.__isRetry
    ) {
      config.__isRetry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // 리프레시 토큰으로 액세스토큰 재발급 요청
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );
        const { accessToken } = data;

        // 새 토큰 저장 및 헤더 갱신
        localStorage.setItem("token", accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        config.headers.Authorization = `Bearer ${accessToken}`;

        // 원래 요청 재시도
        return api(config);
      } catch (refreshError) {
        // 리프레시 토큰도 실패 시 로그아웃 처리
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // 2) 그 외 401 Unauthorized (토큰 없음·잘못됨 등)
    if (response.status === 401 && !config.__isRetry) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return;
    }

    return Promise.reject(error);
  }
);

// 차량 API
export const fetchVehicles = async () => {
  try {
    const res = await api.get("/vehicles");
    return res.data.map((v) => ({
      vin: v.vin,
      name: v.model,
      plate: v.plate_number,
      year: v.year,
    }));
  } catch (err) {
    console.error("[fetchVehicles] Error:", err);
    return [];
  }
};

export const createVehicle = async (payload) => {
  try {
    const res = await api.post("/vehicles", {
      vin: payload.vin,
      model: payload.name,
      plate_number: payload.plate,
      year: payload.year,
    });
    return res.data;
  } catch (err) {
    console.error("[createVehicle] Error:", err);
    throw err;
  }
};

export const updateVehicle = async (oldVin, payload) => {
  try {
    const res = await api.put(`/vehicles/${oldVin}`, {
      vin: payload.vin,
      model: payload.name,
      plate_number: payload.plate,
      year: payload.year,
    });
    return res.data;
  } catch (err) {
    console.error("[updateVehicle] Error:", err);
    throw err;
  }
};

export const deleteVehicle = async (vin) => {
  try {
    const res = await api.delete(`/vehicles/${vin}`);
    return res.data;
  } catch (err) {
    console.error("[deleteVehicle] Error:", err);
    throw err;
  }
};

// 고객 API
export const fetchCustomers = async () => {
  try {
    const res = await api.get("/customers");
    return res.data;
  } catch (err) {
    console.error("[fetchCustomers] Error:", err);
    return [];
  }
};

export const createCustomer = async (data) => {
  try {
    const res = await api.post("/customers", data);
    return res.data;
  } catch (err) {
    console.error("[createCustomer] Error:", err);
    throw err;
  }
};

export const updateCustomer = async (id, data) => {
  try {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("[updateCustomer] Error:", err);
    throw err;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  } catch (err) {
    console.error("[deleteCustomer] Error:", err);
    throw err;
  }
};

// 예약 API
export const fetchReservations = async () => {
  try {
    const res = await api.get("/reservations");
    return res.data.map((r) => ({
      reservation_id: r.reservation_id,
      vin: r.vin,
      customer_id: r.customer_id,
      customer_name: r.customer_name,
      start_datetime: r.start_datetime,
      end_datetime: r.end_datetime,
      status: r.status,
    }));
  } catch (err) {
    console.error("[fetchReservations] Error:", err);
    return [];
  }
};

export const fetchReservationById = async (id) => {
  const res = await api.get(`/reservations/${id}`);
  return res.data;
};

export const createReservation = async (data) => {
  const res = await api.post("/reservations", data);
  return res.data;
};

export const updateReservation = async (reservationId, data) => {
  try {
    // PUT /reservations/:id 로 보냅니다
    const res = await axios.put(
      `${API_BASE}/reservations/${reservationId}`,
      data
    );
    return res.data;
  } catch (err) {
    console.error("[updateReservation] Error:", err);
    throw err;
  }
};
export const deleteReservation = async (reservationId) => {
  try {
    console.log("▶︎ deleteReservation 호출, id=", reservationId);
    const res = await axios.delete(`${API_BASE}/reservations/${reservationId}`);
    console.log("▶︎ DELETE 응답:", res.status);
    return res.data;
  } catch (err) {
    console.error("[deleteReservation] Error:", err);
    throw err;
  }
};

// 인증 API (필요 시 여기서 호출)
export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const { accessToken, refreshToken, user } = res.data;
  // 토큰 저장
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  return { user, accessToken, refreshToken };
};

export const logout = () => {
  const refreshToken = localStorage.getItem("refreshToken");
  api.post("/auth/logout", { refreshToken }).catch(() => {});
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  delete api.defaults.headers.common.Authorization;
  window.location.href = "/login";
};

export default api;
