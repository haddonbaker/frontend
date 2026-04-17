/*
* apiService.js
* Author: Haddon Baker
* Description: A service module that provides functions to interact with the backend API for searching courses, managing the candidate schedule, and saving schedules.
*/

const BASE_URL = 'http://localhost:7000';

/**
 * A helper function to handle responses from the fetch API.
 * It checks for errors and parses the JSON body.
 * @param {Response} response - The response object from a fetch call.
 * @returns {Promise<any>} The parsed JSON data.
 * @throws {Error} Throws an error if the network response was not ok.
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown error occurred with the API request.');
  }
  return response.json();
}

/** Builds a query string like ?semester=Fall&year=2024&username=alice */
function termParams(semester, year, username = null) {
  let params = `?semester=${encodeURIComponent(semester)}&year=${encodeURIComponent(year)}`;
  if (username) params += `&username=${encodeURIComponent(username)}`;
  return params;
}

/**
 * Searches for courses based on a query and filters.
 * @param {string} query - The search text.
 * @param {object} filters - The filter criteria from the FilterModal.
 * @returns {Promise<Array>} A promise that resolves to an array of course results.
 */
export async function searchCourses(query, filters = {}) {
  const response = await fetch(`${BASE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      filter: filters
    })
  });

  return handleResponse(response);
}

/**
 * Fetches alternative course suggestions based on a course and the current schedule.
 * @param {object} course - The course object to find alternatives for.
 * @param {object} schedule - The current schedule object.
 * @param {string} semester - The active semester (enum name, e.g. "Fall").
 * @param {number} year - The active year.
 * @returns {Promise<Array>} A promise that resolves to an array of alternative courses.
 */
export async function suggestAlternatives(course, schedule, semester, year, username = null) {
  const response = await fetch(`${BASE_URL}/suggestAlternatives${termParams(semester, year, username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      course: course,
      schedule: schedule
    })
  });

  return handleResponse(response);
}

/**
 * Saves the current candidate schedule for the student.
 * @param {string} username - The logged-in student's username.
 * @param {string} semester - The active semester.
 * @param {number} year - The active year.
 * @returns {Promise<object>} A promise that resolves to the backend's response.
 */
export async function saveSchedule(username, semester, year) {
  const response = await fetch(`${BASE_URL}/saveSchedule${termParams(semester, year, username)}`, {
    method: 'POST',
  });

  return handleResponse(response);
}

/**
 * Fetches the current candidate schedule from the backend.
 * @param {string} semester - The active semester.
 * @param {number} year - The active year.
 * @returns {Promise<object>} A promise that resolves to the schedule object, including courses and total credits.
 */
export async function getSchedule(semester, year, username = null) {
  const response = await fetch(`${BASE_URL}/schedule${termParams(semester, year, username)}`);
  return handleResponse(response);
}

/**
 * Adds a course to the candidate schedule.
 * The backend is responsible for all logic, including conflict checks.
 * @param {object} schedule - The schedule object to add the course to.
 * @param {object} course - The course object to add.
 * @param {string} semester - The active semester.
 * @param {number} year - The active year.
 * @returns {Promise<object>} A promise that resolves to the backend's response (e.g., the updated schedule).
 */
export async function addCourseToSchedule(schedule, course, semester, year, username = null) {
  const response = await fetch(`${BASE_URL}/addToCalendar${termParams(semester, year, username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schedule: schedule,
      course: course
    })
  });

  return handleResponse(response);
}

/**
 * Removes a course from the candidate schedule.
 * @param {object} schedule - The schedule object to remove the course from.
 * @param {object} course - The course object to remove.
 * @param {string} semester - The active semester.
 * @param {number} year - The active year.
 * @returns {Promise<object>} A promise that resolves to the backend's response (e.g., the updated schedule).
 */
export async function removeCourseFromSchedule(schedule, course, semester, year, username = null) {
  const response = await fetch(`${BASE_URL}/removeFromCalendar${termParams(semester, year, username)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schedule: schedule,
      course: course
    })
  });

  return handleResponse(response);
}

/**
 * Creates a new student account.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{status: string, username: string}>}
 */
export async function createAccount(username, password) {
  const response = await fetch(`${BASE_URL}/createAccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(response);
}

/**
 * Logs in with the given credentials.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{status: string, username: string}>}
 */
export async function login(username, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(response);
}

/**
 * Logs the current user out (client-side only — no server session to invalidate).
 */
export function logout() {
  // No server call needed without sessions; state is cleared in the app.
  return Promise.resolve({ status: 'success' });
}

/**
 * Updates the student's major on the backend.
 * @param {string} username
 * @param {string} major
 * @returns {Promise<{status: string, major: string}>}
 */
export async function updateMajor(username, major) {
  const response = await fetch(`${BASE_URL}/updateMajor?username=${encodeURIComponent(username)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ major }),
  });
  return handleResponse(response);
}

/**
 * Checks whether a username exists on the server.
 * @param {string} username
 * @returns {Promise<{username: string, exists: boolean}>}
 */
export async function getCurrentUser(username) {
  const response = await fetch(`${BASE_URL}/me?username=${encodeURIComponent(username)}`);
  return handleResponse(response);
}
