"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.getErrorMessage = exports.getProgressColor = exports.calculateProgress = exports.sortBy = exports.unique = exports.groupBy = exports.isValidUrl = exports.isValidEmail = exports.roundToDecimals = exports.formatNumber = exports.slugify = exports.truncate = exports.capitalize = exports.daysBetween = exports.isToday = exports.formatDateTime = exports.formatDate = void 0;
// Date utilities
const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
exports.formatDateTime = formatDateTime;
const isToday = (date) => {
    const today = new Date();
    return (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear());
};
exports.isToday = isToday;
const daysBetween = (date1, date2) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.daysBetween = daysBetween;
// String utilities
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
const truncate = (str, length) => {
    return str.length > length ? str.substring(0, length) + "..." : str;
};
exports.truncate = truncate;
const slugify = (str) => {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
exports.slugify = slugify;
// Number utilities
const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
};
exports.formatNumber = formatNumber;
const roundToDecimals = (num, decimals) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
exports.roundToDecimals = roundToDecimals;
// Validation utilities
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
// Array utilities
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = key(item);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};
exports.groupBy = groupBy;
const unique = (array) => {
    return Array.from(new Set(array));
};
exports.unique = unique;
const sortBy = (array, key) => {
    return [...array].sort((a, b) => {
        if (a[key] < b[key])
            return -1;
        if (a[key] > b[key])
            return 1;
        return 0;
    });
};
exports.sortBy = sortBy;
// Goal utilities
const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
};
exports.calculateProgress = calculateProgress;
const getProgressColor = (progress) => {
    if (progress >= 100)
        return "green";
    if (progress >= 75)
        return "blue";
    if (progress >= 50)
        return "yellow";
    if (progress >= 25)
        return "orange";
    return "red";
};
exports.getProgressColor = getProgressColor;
// Error utilities
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    if (typeof error === "string")
        return error;
    return "An unknown error occurred";
};
exports.getErrorMessage = getErrorMessage;
// Local storage utilities (for client-side only)
exports.storage = {
    get: (key) => {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis))
            return null;
        try {
            return globalThis.localStorage.getItem(key);
        }
        catch (_a) {
            return null;
        }
    },
    set: (key, value) => {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis))
            return;
        try {
            globalThis.localStorage.setItem(key, value);
        }
        catch (_a) {
            // Silently fail
        }
    },
    remove: (key) => {
        if (typeof globalThis === "undefined" || !("localStorage" in globalThis))
            return;
        try {
            globalThis.localStorage.removeItem(key);
        }
        catch (_a) {
            // Silently fail
        }
    },
};
//# sourceMappingURL=index.js.map