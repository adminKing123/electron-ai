/**
 * Example utilities for fetching data from connected apps
 * These are example implementations that you can customize based on your needs
 */

import { getAppAccessToken } from "./connectedAppsAuth";

/**
 * Google Fit API Helper Functions
 */

// Fetch user's fitness data sources
export const fetchGoogleFitDataSources = async () => {
  const token = getAppAccessToken("google_fit");
  
  if (!token) {
    throw new Error("Google Fit not connected");
  }

  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataSources",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data sources");
  }

  return await response.json();
};

// Fetch step count for a date range
export const fetchGoogleFitSteps = async (startTime, endTime) => {
  const token = getAppAccessToken("google_fit");
  
  if (!token) {
    throw new Error("Google Fit not connected");
  }

  const body = {
    aggregateBy: [
      {
        dataTypeName: "com.google.step_count.delta",
        dataSourceId:
          "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
      },
    ],
    bucketByTime: { durationMillis: 86400000 }, // 1 day in milliseconds
    startTimeMillis: startTime,
    endTimeMillis: endTime,
  };

  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch step count");
  }

  return await response.json();
};

// Fetch heart rate data
export const fetchGoogleFitHeartRate = async (startTime, endTime) => {
  const token = getAppAccessToken("google_fit");
  
  if (!token) {
    throw new Error("Google Fit not connected");
  }

  const body = {
    aggregateBy: [
      {
        dataTypeName: "com.google.heart_rate.bpm",
      },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime,
    endTimeMillis: endTime,
  };

  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch heart rate");
  }

  return await response.json();
};

// Fetch sleep data
export const fetchGoogleFitSleep = async (startTime, endTime) => {
  const token = getAppAccessToken("google_fit");
  
  if (!token) {
    throw new Error("Google Fit not connected");
  }

  const body = {
    aggregateBy: [
      {
        dataTypeName: "com.google.sleep.segment",
      },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime,
    endTimeMillis: endTime,
  };

  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sleep data");
  }

  return await response.json();
};

// Fetch activity data
export const fetchGoogleFitActivities = async (startTime, endTime) => {
  const token = getAppAccessToken("google_fit");
  
  if (!token) {
    throw new Error("Google Fit not connected");
  }

  const body = {
    aggregateBy: [
      {
        dataTypeName: "com.google.activity.segment",
      },
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime,
    endTimeMillis: endTime,
  };

  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return await response.json();
};

// Helper to get today's date range
export const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return {
    startTime: startOfDay.getTime(),
    endTime: endOfDay.getTime(),
  };
};

// Helper to get last N days range
export const getLastNDaysRange = (days) => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  return {
    startTime: startDate.getTime(),
    endTime: now.getTime(),
  };
};

/**
 * Example usage in a component:
 * 
 * const fetchUserFitnessData = async () => {
 *   try {
 *     const { startTime, endTime } = getLastNDaysRange(7);
 *     const steps = await fetchGoogleFitSteps(startTime, endTime);
 *     const heartRate = await fetchGoogleFitHeartRate(startTime, endTime);
 *     
 *     console.log('Steps:', steps);
 *     console.log('Heart Rate:', heartRate);
 *   } catch (error) {
 *     console.error('Failed to fetch fitness data:', error);
 *   }
 * };
 */
