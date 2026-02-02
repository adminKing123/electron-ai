import {
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
  linkWithPopup,
  OAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import useConnectedAppsStore from "../store/useConnectedAppsStore";
import { notifySuccess, notifyError } from "./notifier";

/**
 * Connect an app using Firebase incremental authorization
 * User is ALREADY signed in, we're just linking additional providers
 */
export const connectApp = async (app) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    notifyError("Please sign in first");
    return false;
  }

  try {
    let provider;
    let credential;

    // Build the provider based on app type
    switch (app.provider) {
      case "google":
        provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: "consent",
          access_type: "offline",
        });
        app.scopes.forEach((scope) => provider.addScope(scope));
        break;

      case "github":
        provider = new OAuthProvider("github.com");
        app.scopes.forEach((scope) => provider.addScope(scope));
        break;

      default:
        throw new Error(`Provider ${app.provider} not supported`);
    }

    // Try to link with popup - this is the CORRECT way
    try {
      const result = await linkWithPopup(currentUser, provider);
      
      // Get credential from result
      if (app.provider === "google") {
        credential = GoogleAuthProvider.credentialFromResult(result);
      } else if (app.provider === "github") {
        credential = OAuthProvider.credentialFromResult(result);
      }

      // Store connection info
      const { setAppConnected } = useConnectedAppsStore.getState();
      setAppConnected(app.id, {
        provider: app.provider,
        scopes: app.scopes,
        accessToken: credential?.accessToken,
      });

      notifySuccess(`${app.name} connected successfully!`);
      return true;

    } catch (linkError) {
      // If linking fails because credential is already in use
      if (linkError.code === "auth/credential-already-in-use") {
        // Check if it's already linked to THIS user
        const providerData = currentUser.providerData || [];
        const isAlreadyLinked = providerData.some(
          (provider) => provider.providerId === `${app.provider}.com` || 
                       provider.providerId === app.provider
        );

        if (isAlreadyLinked) {
          // Already linked to current user, just save to store
          notifySuccess(`${app.name} is already connected!`);
          
          const { setAppConnected } = useConnectedAppsStore.getState();
          setAppConnected(app.id, {
            provider: app.provider,
            scopes: app.scopes,
            accessToken: null, // We don't have the token, but mark as connected
          });
          
          return true;
        } else {
          // Linked to a different user
          notifyError("This account is already connected to a different user.");
          throw linkError;
        }
      }
      
      // Re-throw to outer catch
      throw linkError;
    }

  } catch (error) {
    console.error("Error connecting app:", error);
    
    // 🔥 THE DREADED ERROR - account exists with different credential
    if (error.code === "auth/account-exists-with-different-credential") {
      try {
        // Get the pending credential and email
        const email = error.customData?.email;
        let pendingCred;

        if (app.provider === "github") {
          pendingCred = OAuthProvider.credentialFromError(error);
        } else if (app.provider === "google") {
          pendingCred = GoogleAuthProvider.credentialFromError(error);
        }
        
        if (!email || !pendingCred) {
          notifyError("Unable to link accounts. Missing credential information.");
          throw error;
        }

        // Check which provider the user originally signed in with
        const methods = await fetchSignInMethodsForEmail(auth, email);
        
        if (methods.length === 0) {
          notifyError("No existing account found with this email.");
          throw error;
        }

        // Get the first provider name (the original one)
        const originalProvider = methods[0].includes("google") 
          ? "Google" 
          : methods[0].includes("github") 
          ? "GitHub" 
          : methods[0];

        // User needs to sign in with original provider first, then link
        notifyError(
          `This email is already used with ${originalProvider}. The account has been linked automatically, but you may need to refresh.`
        );

        // Try to link the credential to current user anyway
        // (they're already signed in with the original provider)
        if (currentUser.email === email) {
          await linkWithCredential(currentUser, pendingCred);
          
          // Store connection info
          const { setAppConnected } = useConnectedAppsStore.getState();
          setAppConnected(app.id, {
            provider: app.provider,
            scopes: app.scopes,
            accessToken: pendingCred.accessToken,
          });
          
          notifySuccess(`${app.name} linked successfully!`);
          return true;
        }

        throw error;

      } catch (linkError) {
        console.error("Error during account linking:", linkError);
        
        if (linkError.code === "auth/provider-already-linked") {
          // Already linked, just mark as connected
          const { setAppConnected } = useConnectedAppsStore.getState();
          setAppConnected(app.id, {
            provider: app.provider,
            scopes: app.scopes,
            accessToken: null,
          });
          notifySuccess(`${app.name} is already connected!`);
          return true;
        } else if (linkError.code === "auth/credential-already-in-use") {
          // Check if already linked to current user
          const providerData = currentUser.providerData || [];
          const isAlreadyLinked = providerData.some(
            (provider) => provider.providerId === `${app.provider}.com` || 
                         provider.providerId === app.provider
          );

          if (isAlreadyLinked) {
            const { setAppConnected } = useConnectedAppsStore.getState();
            setAppConnected(app.id, {
              provider: app.provider,
              scopes: app.scopes,
              accessToken: null,
            });
            notifySuccess(`${app.name} is already connected!`);
            return true;
          } else {
            notifyError("This credential is already used by another account.");
          }
        } else {
          notifyError("Failed to link account. Please try again or contact support.");
        }
        
        throw linkError;
      }
    } 
    
    // Handle other common errors
    else if (error.code === "auth/popup-closed-by-user") {
      notifyError("Connection cancelled");
    } else if (error.code === "auth/popup-blocked") {
      notifyError("Popup blocked. Please allow popups for this site.");
    } else if (error.code === "auth/provider-already-linked") {
      notifyError(`${app.name} is already connected to your account.`);
    } else if (error.code === "auth/credential-already-in-use") {
      notifyError("This credential is already associated with a different account.");
    } else {
      notifyError(`Failed to connect ${app.name}`);
    }
    
    throw error;
  }
};

/**
 * Disconnect an app and revoke permissions
 */
export const disconnectApp = async (appId) => {
  try {
    const { connectedApps, setAppDisconnected } = useConnectedAppsStore.getState();
    const appData = connectedApps[appId];

    if (!appData) {
      throw new Error("App not found");
    }

    // If you have an access token, you can revoke it
    // This is provider-specific, example for Google:
    if (appData.provider === "google" && appData.accessToken) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${appData.accessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
      } catch (revokeError) {
        console.error("Error revoking token:", revokeError);
        // Continue with disconnection even if revoke fails
      }
    }

    // Remove from store
    setAppDisconnected(appId);
    
    notifySuccess("App disconnected successfully");
    return true;
  } catch (error) {
    console.error("Error disconnecting app:", error);
    notifyError("Failed to disconnect app");
    throw error;
  }
};

/**
 * Check if an app is connected
 */
export const isAppConnected = (appId) => {
  const { connectedApps } = useConnectedAppsStore.getState();
  return connectedApps[appId]?.isConnected || false;
};

/**
 * Get access token for a connected app
 */
export const getAppAccessToken = (appId) => {
  const { connectedApps } = useConnectedAppsStore.getState();
  return connectedApps[appId]?.accessToken;
};

/**
 * Refresh access token if needed
 * Note: Firebase automatically handles token refresh,
 * but you might need custom logic for certain providers
 */
export const refreshAppToken = async (appId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get fresh token from Firebase
    const token = await user.getIdToken(true);
    
    // Update in store if needed
    const { updateAppData } = useConnectedAppsStore.getState();
    updateAppData(appId, {
      lastTokenRefresh: new Date().toISOString(),
    });

    return token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
