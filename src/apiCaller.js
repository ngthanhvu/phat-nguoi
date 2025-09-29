import axios from "axios";
import Tesseract from "tesseract.js";
import qs from "qs";
import fs from "fs";
import tough from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { extractTrafficViolations } from "./extractTrafficViotations.js";

const { CookieJar } = tough;

/**
 * Configuration constants
 */
const CONFIG = {
  BASE_URL: "https://www.csgt.vn",
  CAPTCHA_PATH: "/lib/captcha/captcha.class.php",
  FORM_ENDPOINT: "/?mod=contact&task=tracuu_post&ajax",
  RESULTS_URL: "https://www.csgt.vn/tra-cuu-phuong-tien-vi-pham.html",
  MAX_RETRIES: 5,
  TIMEOUT: 30000, // 30 seconds timeout
  RETRY_DELAY: 2000, // 2 seconds delay between retries
  HEADERS: {
    USER_AGENT:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ACCEPT:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    CONTENT_TYPE: "application/x-www-form-urlencoded",
  },
};

function getTimeStamp() {
  const now = new Date();
  return `[${now.toLocaleTimeString("vi-VN", { hour12: false })}]`;
}

/**
 * Creates and configures an axios instance with cookie support
 * @returns {Object} Configured axios instance
 */
function createAxiosInstance() {
  const jar = new CookieJar();
  const instance = axios.create({
    jar,
    withCredentials: true,
    baseURL: CONFIG.BASE_URL,
    timeout: CONFIG.TIMEOUT,
    headers: {
      "User-Agent": CONFIG.HEADERS.USER_AGENT,
      Accept: CONFIG.HEADERS.ACCEPT,
    },
  });
  return wrapper(instance);
}

/**
 * Fetches and processes captcha image with retry mechanism
 * @param {Object} instance - Axios instance
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<string>} Recognized captcha text
 */
async function getCaptcha(instance, retries = 3) {
  try {
    const image = await instance.get(CONFIG.CAPTCHA_PATH, {
      responseType: "arraybuffer",
    });

    // Optional: save captcha for debugging
    // fs.writeFileSync("captcha.jpg", Buffer.from(image.data), "binary");

    const captchaResult = await Tesseract.recognize(image.data);
    return captchaResult.data.text.trim();
  } catch (error) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND')) {
      console.log(`${getTimeStamp()} Captcha request failed (${error.code}), retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return getCaptcha(instance, retries - 1);
    }
    throw new Error(`Failed to get or process captcha: ${error.message}`);
  }
}

/**
 * Submits form data with plate number and captcha with retry mechanism
 * @param {Object} instance - Axios instance
 * @param {string} plate - License plate number
 * @param {string} captcha - Recognized captcha text
 * @param {string} vehicleType - Vehicle type ("car" or "motorcycle")
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Object>} API response
 */
async function postFormData(instance, plate, captcha, vehicleType = "car", retries = 3) {
  try {
    // Map vehicle type to API code
    const vehicleCode = vehicleType === "motorcycle" ? "2" : "1";
    
    const formData = qs.stringify({
      BienKS: plate,
      Xe: vehicleCode,
      captcha,
      ipClient: "9.9.9.91",
      cUrl: "1",
    });

    return await instance.post(CONFIG.FORM_ENDPOINT, formData, {
      headers: {
        "Content-Type": CONFIG.HEADERS.CONTENT_TYPE,
      },
    });
  } catch (error) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND')) {
      console.log(`${getTimeStamp()} Form submission failed (${error.code}), retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return postFormData(instance, plate, captcha, vehicleType, retries - 1);
    }
    throw error;
  }
}

/**
 * Fetches traffic violation results with retry mechanism
 * @param {Object} instance - Axios instance
 * @param {string} plate - License plate number
 * @param {string} vehicleType - Vehicle type ("car" or "motorcycle")
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Object>} Results page response
 */
async function getViolationResults(instance, plate, vehicleType = "car", retries = 3) {
  try {
    // Map vehicle type to API code
    const vehicleCode = vehicleType === "motorcycle" ? "2" : "1";
    return await instance.get(`${CONFIG.RESULTS_URL}?&LoaiXe=${vehicleCode}&BienKiemSoat=${plate}`);
  } catch (error) {
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND')) {
      console.log(`${getTimeStamp()} Results request failed (${error.code}), retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return getViolationResults(instance, plate, vehicleType, retries - 1);
    }
    throw error;
  }
}

/**
 * Main function to call the traffic violation API
 * @param {string} plate - License plate number
 * @param {string} vehicleType - Vehicle type ("car" or "motorcycle")
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Object|null>} Extracted traffic violations or null on failure
 */
export async function callAPI(plate, vehicleType = "car", retries = CONFIG.MAX_RETRIES) {
  try {
    console.log(`${getTimeStamp()} Fetching traffic violations for ${vehicleType} plate:`, plate);
    const instance = createAxiosInstance();
    const captcha = await getCaptcha(instance);
    // console.log(`Using captcha: ${captcha}`);

    const response = await postFormData(instance, plate, captcha, vehicleType);

    // Handle failed captcha case
    if (response.data === 404) {
      if (retries > 0) {
        console.log(
          `${getTimeStamp()} Captcha verification failed ${captcha}. Retrying... (${
            CONFIG.MAX_RETRIES - retries + 1
          }/${CONFIG.MAX_RETRIES})`
        );
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return callAPI(plate, vehicleType, retries - 1);
      } else {
        throw new Error(
          "Maximum retry attempts reached. Could not verify captcha."
        );
      }
    }

    const resultsResponse = await getViolationResults(instance, plate, vehicleType);
    const violations = extractTrafficViolations(resultsResponse.data);

    return violations;
  } catch (error) {
    // Handle network errors with retry
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND')) {
      console.log(`${getTimeStamp()} Network error (${error.code}) for ${vehicleType} plate ${plate}, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return callAPI(plate, vehicleType, retries - 1);
    }
    
    console.error(
      `Error fetching traffic violations for ${vehicleType} plate ${plate}:`,
      error.message
    );
    return null;
  }
}
