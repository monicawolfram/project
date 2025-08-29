// utils/sms.js
const axios = require("axios");

async function sendSms(phone, message) {
  const username = 'monicamgeni';
  const password = 'jm@pbQXud4jdXEn';
  const url = "https://messaging-service.co.tz/api/sms/v1/text/single";

  // Normalize: if phone starts with 0 and has 10 digits → convert to +255
  let normalizedPhone = phone;
  if (/^0\d{9}$/.test(phone)) {
    normalizedPhone = "+255" + phone.substring(1);
  }

  const postData = {
    from: "REMINDER", // your registered sender ID
    to: normalizedPhone,
    text: message,
  };

  try {
    const response = await axios.post(url, postData, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization":
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        // "Basic bW9uaWNhbWdlbmk6am1AcGJRWHVkNGpkWEVu"
      },
    });

    return {
      success: true,
      response: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
}




// utils/nextsms.js
async function sendSMS(to, message) {
  try {
    console.log(`Sending SMS to ${to}: ${message}`);
    // integrate your NextSMS API here
    return { success: true };
  } catch (err) {
    console.error("NextSMS error:", err);
    return { success: false, message: err.message };
  }
}



module.exports = { sendSms };
