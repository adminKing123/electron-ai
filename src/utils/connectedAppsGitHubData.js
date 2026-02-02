/**
 * GitHub API Helper Functions
 * Utilities for fetching data from GitHub API
 */

import { getAppAccessToken } from "./connectedAppsAuth";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Get authenticated user information
 */
export const fetchGitHubUser = async () => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return await response.json();
};

/**
 * List user's repositories
 */
export const fetchGitHubRepositories = async (options = {}) => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const {
    sort = "updated",
    direction = "desc",
    per_page = 30,
    page = 1,
    type = "all", // all, owner, public, private, member
  } = options;

  const params = new URLSearchParams({
    sort,
    direction,
    per_page: per_page.toString(),
    page: page.toString(),
    type,
  });

  const response = await fetch(
    `${GITHUB_API_BASE}/user/repos?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repositories");
  }

  return await response.json();
};

/**
 * Get repository details
 */
export const fetchGitHubRepository = async (owner, repo) => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repository");
  }

  return await response.json();
};

/**
 * List commits for a repository
 */
export const fetchGitHubCommits = async (owner, repo, options = {}) => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const { per_page = 30, page = 1, sha = null } = options;

  let url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`;
  
  if (sha) {
    url += `&sha=${sha}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch commits");
  }

  return await response.json();
};

/**
 * Get user's organizations
 */
export const fetchGitHubOrganizations = async () => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const response = await fetch(`${GITHUB_API_BASE}/user/orgs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }

  return await response.json();
};

/**
 * Get user's starred repositories
 */
export const fetchGitHubStarredRepos = async (options = {}) => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const { per_page = 30, page = 1 } = options;

  const response = await fetch(
    `${GITHUB_API_BASE}/user/starred?per_page=${per_page}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch starred repositories");
  }

  return await response.json();
};

/**
 * Get user's recent activity/events
 */
export const fetchGitHubUserEvents = async (username, options = {}) => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const { per_page = 30, page = 1 } = options;

  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/events?per_page=${per_page}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user events");
  }

  return await response.json();
};

/**
 * Search repositories
 */
export const searchGitHubRepositories = async (query, options = {}) => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const { sort = "stars", order = "desc", per_page = 30, page = 1 } = options;

  const params = new URLSearchParams({
    q: query,
    sort,
    order,
    per_page: per_page.toString(),
    page: page.toString(),
  });

  const response = await fetch(
    `${GITHUB_API_BASE}/search/repositories?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search repositories");
  }

  return await response.json();
};

/**
 * Get repository contents
 */
export const fetchGitHubRepoContents = async (owner, repo, path = "") => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repository contents");
  }

  return await response.json();
};

/**
 * Get pull requests for a repository
 */
export const fetchGitHubPullRequests = async (owner, repo, state = "open") => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=${state}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pull requests");
  }

  return await response.json();
};

/**
 * Get repository issues
 */
export const fetchGitHubIssues = async (owner, repo, state = "open") => {
  const token = getAppAccessToken("github");
  
  if (!token) {
    throw new Error("GitHub not connected");
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=${state}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }

  return await response.json();
};

/**
 * Example usage:
 * 
 * const fetchUserGitHubData = async () => {
 *   try {
 *     const user = await fetchGitHubUser();
 *     const repos = await fetchGitHubRepositories({ per_page: 10 });
 *     const orgs = await fetchGitHubOrganizations();
 *     
 *     console.log('User:', user);
 *     console.log('Repositories:', repos);
 *     console.log('Organizations:', orgs);
 *   } catch (error) {
 *     console.error('Failed to fetch GitHub data:', error);
 *   }
 * };
 */
