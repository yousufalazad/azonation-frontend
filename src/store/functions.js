import { reactive } from "vue";
import router from "../router/router";
import axios from "axios";
import Swal from "sweetalert2";

const functions = {
  // Function to set a cookie
  setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
      name + "=" + encodeURIComponent(value) + expires + "; path=/";
  },

  // Function to get a cookie by name
  getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookies[i].substring(nameEQ.length));
      }
    }
    return null;
  },

  // Function to delete a cookie by setting its expiration date in the past
  deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  },
};

export default functions;
