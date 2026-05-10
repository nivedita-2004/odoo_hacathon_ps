const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const generateUniqueSlug = (text, suffix = '') => {
  const baseSlug = slugify(text);
  const uniqueSuffix = suffix || Date.now().toString(36);
  return `${baseSlug}-${uniqueSuffix}`;
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const calculateDateDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
};

const paginateResults = (items, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
      hasNextPage: endIndex < items.length,
      hasPrevPage: startIndex > 0
    }
  };
};

const calculateTripDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    days,
    nights: days - 1
  };
};

const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

const removeDuplicates = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

const generateRandomString = (length = 10) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  slugify,
  generateUniqueSlug,
  formatCurrency,
  calculateDateDifference,
  formatDate,
  sanitizeInput,
  paginateResults,
  calculateTripDuration,
  groupBy,
  removeDuplicates,
  generateRandomString,
  isValidEmail,
  isValidDate,
  sleep
};
