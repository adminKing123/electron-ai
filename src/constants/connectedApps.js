import { SiGooglefit, SiGoogledrive, SiGithub } from "react-icons/si";

// Configuration for all available apps
export const AVAILABLE_APPS = [
  {
    id: "google_fit",
    name: "Google Fit",
    description: "Sync your fitness and health data to personalize your experience",
    icon: <SiGooglefit />,
    provider: "google",
    scopes: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.location.read",
      "https://www.googleapis.com/auth/fitness.nutrition.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
    ],
    dataTypes: [
      "Activity & Steps",
      "Heart Rate",
      "Sleep Data",
      "Body Metrics",
      "Nutrition",
      "Location",
    ],
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Access and manage your files stored in Google Drive",
    icon: <SiGoogledrive />,
    provider: "google",
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
    dataTypes: [
      "File Access",
      "File Metadata",
      "Folder Structure",
      "Shared Files",
      "File Search",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect your GitHub account to access repositories and code",
    icon: <SiGithub />,
    provider: "github",
    scopes: [
      "repo",
      "user",
      "read:org",
    ],
    dataTypes: [
      "Repositories",
      "Code Access",
      "Commits & Activity",
      "Organizations",
      "User Profile",
    ],
  },
  // Add more apps here in the future
  // Example structure:
  // {
  //   id: "spotify",
  //   name: "Spotify",
  //   description: "Connect your music preferences",
  //   icon: <SiSpotify />,
  //   provider: "spotify",
  //   scopes: ["user-read-recently-played", "user-top-read"],
  //   dataTypes: ["Listening History", "Top Artists", "Playlists"],
  // },
];

// Helper function to get app by ID
export const getAppById = (appId) => {
  return AVAILABLE_APPS.find((app) => app.id === appId);
};
