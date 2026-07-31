// Generic data extraction utilities for handling complex JSON structures

/**
 * Extract rating from various formats like ['"4"'], ["4"], "4", 4, etc.
 * @param {any} ratings - The ratings data in various formats
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} - Extracted rating or fallback
 */
export const extractRating = (ratings, fallback = "N/A") => {
  if (!ratings) return fallback;

  try {
    let ratingValue = null;

    // If it's a string, try to parse it
    if (typeof ratings === 'string') {
      try {
        const parsed = JSON.parse(ratings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Extract number from string like '"4"' -> '4' -> 4
          const ratingStr = parsed[0];
          const numberMatch = ratingStr.match(/(\d+(?:\.\d+)?)/);
          ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
        } else {
          ratingValue = parseFloat(parsed);
        }
      } catch (parseError) {
        // If JSON.parse fails, try to extract number directly
        const numberMatch = ratings.match(/(\d+(?:\.\d+)?)/);
        ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
      }
    }
    // If it's already an array
    else if (Array.isArray(ratings) && ratings.length > 0) {
      const ratingStr = ratings[0];
      const numberMatch = ratingStr.match(/(\d+(?:\.\d+)?)/);
      ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
    }
    // If it's a number
    else if (typeof ratings === 'number') {
      ratingValue = ratings;
    }
    // Otherwise, try to extract number from string representation
    else {
      const numberMatch = ratings.toString().match(/(\d+(?:\.\d+)?)/);
      ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
    }

    // Format with one decimal place
    if (ratingValue !== null && !isNaN(ratingValue)) {
      return ratingValue.toFixed(1);
    }

    return fallback;
  } catch (error) {
    // If parsing fails, try to extract number directly
    const numberMatch = ratings.toString().match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      const ratingValue = parseFloat(numberMatch[1]);
      if (!isNaN(ratingValue)) {
        return ratingValue.toFixed(1);
      }
    }
    return fallback;
  }
};

/**
 * Extract and flatten array data from nested JSON strings
 * @param {any} data - The data to extract from
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} - Flattened array data as comma-separated string
 */
export const extractArrayData = (data, fallback = "N/A") => {
  if (!data) return fallback;

  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.flat().join(", ");
      }
      return parsed.toString();
    }

    if (Array.isArray(data)) {
      return data.flat().join(", ");
    }

    return data.toString();
  } catch (error) {
    return data.toString();
  }
};

/**
 * Extract first item from array data
 * @param {any} data - The data to extract from
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} - First item from array or fallback
 */
export const extractFirstItem = (data, fallback = "N/A") => {
  if (!data) return fallback;

  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].toString();
      }
      return parsed.toString();
    }

    if (Array.isArray(data) && data.length > 0) {
      return data[0].toString();
    }

    return data.toString();
  } catch (error) {
    return data.toString();
  }
};

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} - Parsed JSON or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  if (!jsonString) return fallback;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
};

/**
 * Extract date from selectDate JSON string format
 * @param {string|array} selectDate - The selectDate data
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} - Formatted date or fallback
 */
export const extractDate = (selectDate, fallback = "Date TBD") => {
  if (!selectDate) return fallback;

  try {
    let parsed;
    if (typeof selectDate === 'string') {
      parsed = JSON.parse(selectDate);
    } else if (Array.isArray(selectDate)) {
      parsed = selectDate;
    } else {
      return fallback;
    }

    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].BatchDate) {
      return new Date(parsed[0].BatchDate).toLocaleDateString();
    }

    return fallback;
  } catch (error) {
    console.warn('Date extraction error:', error);
    return fallback;
  }
};

/**
 * Extract seats from numberOfSeats JSON string format
 * @param {string|array} numberOfSeats - The numberOfSeats data
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} - Number of seats or fallback
 */
export const extractSeats = (numberOfSeats, fallback = "N/A") => {
  if (!numberOfSeats) return fallback;

  try {
    let parsed;
    if (typeof numberOfSeats === 'string') {
      parsed = JSON.parse(numberOfSeats);
    } else if (Array.isArray(numberOfSeats)) {
      parsed = numberOfSeats;
    } else {
      return fallback;
    }

    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].batchSeats) {
      return parsed[0].batchSeats;
    }

    return fallback;
  } catch (error) {
    console.warn('Seats extraction error:', error);
    return fallback;
  }
};

/**
 * Flatten nested arrays and extract clean data
 * @param {any} data - Data to flatten
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {any} - Flattened data
 */
export const flattenArray = (data, fallback = "N/A") => {
  if (!data) return fallback;

  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.flat();
      }
      return parsed;
    }

    if (Array.isArray(data)) {
      return data.flat();
    }

    return data;
  } catch (error) {
    return data;
  }
};

/**
 * Get clean rating from various formats (more robust version)
 * @param {any} ratings - The ratings data
 * @param {string} fallback - Fallback value if extraction fails
 * @returns {string} - Clean rating value
 */
export const getCleanRating = (ratings, fallback = "N/A") => {
  if (!ratings) return fallback;

  try {
    let ratingValue = null;

    // Handle string format
    if (typeof ratings === 'string') {
      const parsed = safeJsonParse(ratings);
      if (Array.isArray(parsed)) {
        const flattened = flattenArray(parsed);
        if (flattened.length > 0) {
          const ratingStr = flattened[0].toString();
          const numberMatch = ratingStr.match(/(\d+(?:\.\d+)?)/);
          ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
        }
      } else {
        const numberMatch = ratings.match(/(\d+(?:\.\d+)?)/);
        ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
      }
    }
    // Handle array format
    else if (Array.isArray(ratings)) {
      const flattened = flattenArray(ratings);
      if (flattened.length > 0) {
        const ratingStr = flattened[0].toString();
        const numberMatch = ratingStr.match(/(\d+(?:\.\d+)?)/);
        ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
      }
    }
    // Handle number format
    else if (typeof ratings === 'number') {
      ratingValue = ratings;
    }
    // Fallback to string extraction
    else {
      const numberMatch = ratings.toString().match(/(\d+(?:\.\d+)?)/);
      ratingValue = numberMatch ? parseFloat(numberMatch[1]) : null;
    }

    // Format with one decimal place
    if (ratingValue !== null && !isNaN(ratingValue)) {
      return ratingValue.toFixed(1);
    }

    return fallback;
  } catch (error) {
    console.warn('Rating extraction error:', error);
    return fallback;
  }
};
