/**
 * Utility functions for handling and formatting error messages
 */

/**
 * Sanitizes error messages to be user-friendly and prevent UI disruption
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";
  
  // Early return for string errors
  if (typeof error === "string") {
    return sanitizeTechnicalErrors(error);
  }
  
  // Early return for Error instances
  if (error instanceof Error) {
    return sanitizeTechnicalErrors(error.message);
  }
  
  // Early return if not an object
  if (typeof error !== "object" || error === null) {
    return "An unexpected error occurred";
  }
  
  // Handle wagmi/viem error objects with early returns
  if ("message" in error && typeof error.message === "string") {
    return sanitizeTechnicalErrors(error.message);
  }
  
  if ("shortMessage" in error && typeof error.shortMessage === "string") {
    return sanitizeTechnicalErrors(error.shortMessage);
  }
  
  if ("reason" in error && typeof error.reason === "string") {
    return sanitizeTechnicalErrors(error.reason);
  }
  
  // If no message found, return generic error
  return "An unexpected error occurred";
}

/**
 * Converts technical error messages to user-friendly ones
 */
function sanitizeTechnicalErrors(message: string): string {
  // Truncate very long messages
  if (message.length > 200) {
    message = message.substring(0, 200) + "...";
  }
  
  // Common error patterns and their user-friendly replacements
  const errorMappings: Record<string, string> = {
    // User rejection
    "User rejected the request": "Transaction was cancelled by user",
    "user rejected": "Transaction was cancelled",
    "rejected": "Transaction was cancelled",
    
    // Network errors
    "network error": "Network connection issue. Please check your internet connection",
    "timeout": "Request timed out. Please try again",
    "connection": "Connection issue. Please try again",
    
    // Gas errors
    "gas": "Insufficient gas for transaction",
    "out of gas": "Transaction failed due to insufficient gas",
    
    // Contract errors
    "execution reverted": "Transaction failed",
    "revert": "Transaction failed",
    "insufficient funds": "Insufficient funds for transaction",
    
    // Wallet errors
    "wallet": "Wallet connection issue",
    "metamask": "MetaMask connection issue",
    
    // Generic technical terms
    "contract call": "Transaction",
    "function": "Operation",
    "args": "parameters",
    "data:": "Transaction data:",
  };
  
  const sanitizedMessage = message.toLowerCase();
  
  // Apply mappings
  for (const [technical, userFriendly] of Object.entries(errorMappings)) {
    if (sanitizedMessage.includes(technical)) {
      return userFriendly;
    }
  }
  
  // If it's a very technical message with lots of hex data, provide a generic message
  if (message.includes("0x") && message.length > 100) {
    return "Transaction failed. Please try again";
  }
  
  // Return the original message if it's reasonably short and user-friendly
  return message;
}

/**
 * Gets a user-friendly error message for common blockchain operations
 */
export function getOperationErrorMessage(operation: string, error: unknown): string {
  const baseMessage = sanitizeErrorMessage(error);
  
  // If we got a generic message, make it specific to the operation
  if (baseMessage === "Transaction failed. Please try again") {
    return `${operation} failed. Please try again`;
  }
  
  return baseMessage;
}

/**
 * Common operation names for error messages
 */
export const OPERATIONS = {
  REGISTER: "Registration",
  CREATE_LOCK: "Lock creation",
  WITHDRAW: "Withdrawal",
  UPDATE_PROFILE: "Profile update",
  DEACTIVATE: "Account deactivation",
  APPROVE: "Token approval",
} as const;
