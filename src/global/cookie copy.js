const functions = {
  // Set a cookie
  setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
  },

  // Get a cookie
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

  // Delete a cookie
  deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  },

  // Save user data (can include first_name, last_name, org_name, etc.)
  saveUserToCookie(user, days = 7) {
    this.setCookie("user", JSON.stringify(user), days);
  },

  // Get user data as object
  getUserFromCookie() {
    const user = this.getCookie("user");
    return user ? JSON.parse(user) : null;
  },

  // Get display name for UI use
  getDisplayName(user) {
    if (!user) return "";
    if (user.type === "individual") {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    } else if (user.type === "organisation") {
      return user.org_name || "Your Organisation Name";
    }
    return "User";
  },
};
export default functions;