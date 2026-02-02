/**
 * Google Drive API Helper Functions
 * Example utilities for fetching data from Google Drive
 */

import { getAppAccessToken } from "./connectedAppsAuth";

/**
 * List files from Google Drive
 */
export const fetchGoogleDriveFiles = async (options = {}) => {
  const token = getAppAccessToken("google_drive");
  
  if (!token) {
    throw new Error("Google Drive not connected");
  }

  const {
    pageSize = 10,
    pageToken = null,
    query = null,
    orderBy = "modifiedTime desc",
    fields = "files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)"
  } = options;

  let url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&orderBy=${orderBy}&fields=nextPageToken,${fields}`;
  
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Drive files");
  }

  return await response.json();
};

/**
 * Get file metadata
 */
export const fetchGoogleDriveFileMetadata = async (fileId, fields = "*") => {
  const token = getAppAccessToken("google_drive");
  
  if (!token) {
    throw new Error("Google Drive not connected");
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch file metadata");
  }

  return await response.json();
};

/**
 * Search files in Google Drive
 */
export const searchGoogleDriveFiles = async (searchTerm) => {
  const query = `name contains '${searchTerm}' and trashed=false`;
  return await fetchGoogleDriveFiles({ query });
};

/**
 * List files by MIME type
 */
export const fetchGoogleDriveFilesByType = async (mimeType) => {
  const query = `mimeType='${mimeType}' and trashed=false`;
  return await fetchGoogleDriveFiles({ query });
};

/**
 * Get recently modified files
 */
export const fetchRecentlyModifiedFiles = async (pageSize = 10) => {
  return await fetchGoogleDriveFiles({
    pageSize,
    orderBy: "modifiedTime desc",
    query: "trashed=false"
  });
};

/**
 * Get shared files
 */
export const fetchSharedFiles = async () => {
  const query = "sharedWithMe=true and trashed=false";
  return await fetchGoogleDriveFiles({ query });
};

/**
 * Get storage quota information
 */
export const fetchGoogleDriveStorageQuota = async () => {
  const token = getAppAccessToken("google_drive");
  
  if (!token) {
    throw new Error("Google Drive not connected");
  }

  const response = await fetch(
    "https://www.googleapis.com/drive/v3/about?fields=storageQuota,user",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch storage quota");
  }

  return await response.json();
};

/**
 * Download file content
 */
export const downloadGoogleDriveFile = async (fileId) => {
  const token = getAppAccessToken("google_drive");
  
  if (!token) {
    throw new Error("Google Drive not connected");
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  return await response.blob();
};

/**
 * Helper to format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Example usage:
 * 
 * const fetchUserDriveData = async () => {
 *   try {
 *     const recentFiles = await fetchRecentlyModifiedFiles(5);
 *     const quota = await fetchGoogleDriveStorageQuota();
 *     
 *     console.log('Recent Files:', recentFiles.files);
 *     console.log('Storage:', quota.storageQuota);
 *   } catch (error) {
 *     console.error('Failed to fetch Drive data:', error);
 *   }
 * };
 */
