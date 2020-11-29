import axios from "axios";
import axiosRetry from "axios-retry";

const api = axios.create({
  baseURL: "https://contingencia.defesacivil.site/",
});

axiosRetry(api);

export default api;
