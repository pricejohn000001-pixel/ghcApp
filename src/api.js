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
    };

    axiosInstance
      .request(config)
      .then((res) => {
        callback(res.data, false);
      })
      .catch((err) => {
        if (err.response !== undefined) {
          callback(err.response, true);
        } else {
          callback(undefined, true);
        }
      });
  }
}

const app = new ApiCall();
export default app;
export { axiosInstance, appOrigin };

