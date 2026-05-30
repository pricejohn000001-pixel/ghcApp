import axios from "axios";

const APP_ENVIRONMENT = "prod";
let axiosBaseUrl, appOrigin;

if (APP_ENVIRONMENT === "dev") {
  appOrigin = "http://localhost";
  axiosBaseUrl = "http://172.20.10.2:4000";
} else {
  appOrigin = "https://ghcservices.assam.gov.in";
  axiosBaseUrl = "https://ghcservices.assam.gov.in";
}

const axiosInstance = axios.create({
  baseURL: axiosBaseUrl,
  timeout: 60000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async function (config) {
    config.headers = config.headers || {};
    config.headers["Content-Type"] = config.headers["Content-Type"] || "application/json";
    
    // Add Bearer Token for cis-api endpoints
    if (config.url && config.url.includes("/cis-api/")) {
      config.headers["Authorization"] = `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`;
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

class ApiCall {
  invokeApi(request, callback) {
    const config = {
      method: request.method,
      url: request.url,
      data: request.data,
      params: request.params,
      headers: request.headers || { "Content-Type": "application/json" },
      responseType: request.responseType || "json",
      withCredentials: request.withCredentials !== undefined ? request.withCredentials : true,
    };

    axiosInstance
      .request(config)
      .then((res) => {
        callback(res.data, false);
      })
      .catch((err) => {
        console.error("API Error Details:", {
          message: err.message,
          url: config.url,
          method: config.method,
          status: err.response?.status,
          data: err.response?.data
        });
        if (err.response !== undefined) {
          callback(err.response, true);
        } else {
          callback(err, true);
        }
      });
  }
}

const app = new ApiCall();
export default app;
export { axiosInstance, appOrigin };

