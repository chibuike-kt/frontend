import Axios from 'axios'

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,      // sends cookies cross-origin
  withXSRFToken: true,        // Axios handles XSRF token automatically
})

export default axios
