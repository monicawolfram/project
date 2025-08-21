// utils/sms.js
const axios = require("axios");

async function sendSms(phone, message) {
  const username = 'developer_nkya';
  const password = '123123@1';
  const url = "https://messaging-service.co.tz/api/sms/v1/text/single";

  // Normalize: if phone starts with 0 and has 10 digits → convert to +255
  let normalizedPhone = phone;
  if (/^0\d{9}$/.test(phone)) {
    normalizedPhone = "+255" + phone.substring(1);
  }

  const postData = {
    from: "SCHOOL", // your registered sender ID
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

module.exports = { sendSms };
