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
 * Saves the current candidate schedule for the student.
 * @param {object} schedule - The schedule object to save.
 * @param {object} student - The student object.
 * @returns {Promise<object>} A promise that resolves to the backend's response.
 */
export async function saveSchedule(schedule, student) {
  const response = await fetch(`${BASE_URL}/saveSchedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schedule: schedule,
      student: student
    })
  });

  return handleResponse(response);
}

/**
 * Fetches the current candidate schedule from the backend.
 * @returns {Promise<object>} A promise that resolves to the schedule object, including courses and total credits.
 */
export async function getSchedule() {
  const response = await fetch(`${BASE_URL}/schedule`);
  return handleResponse(response);
}

/**
 * Adds a course to the candidate schedule.
 * The backend is responsible for all logic, including conflict checks.
 * @param {object} schedule - The schedule object to add the course to.
 * @param {object} course - The course object to add.
 * @returns {Promise<object>} A promise that resolves to the backend's response (e.g., the updated schedule).
 */
export async function addCourseToSchedule(schedule, course) {
  const response = await fetch(`${BASE_URL}/addToCalendar`, {
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
 * @returns {Promise<object>} A promise that resolves to the backend's response (e.g., the updated schedule).
 */
export async function removeCourseFromSchedule(schedule, course) {
  const response = await fetch(`${BASE_URL}/removeFromCalendar`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      schedule: schedule,
      course: course
    })
  });

  return handleResponse(response);
}