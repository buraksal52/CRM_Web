/**
 * Utility functions for role-based access control
 */

/**
 * Check if the current user is an admin
 * @returns {boolean} true if user is admin, false otherwise
 */
export const isAdmin = () => {
  const role = localStorage.getItem('user_role');
  return role === 'admin';
};

/**
 * Check if the current user is a regular user
 * @returns {boolean} true if user is regular user, false otherwise
 */
export const isRegularUser = () => {
  const role = localStorage.getItem('user_role');
  return role === 'user';
};

/**
 * Get current user's role
 * @returns {string} 'admin' or 'user' or null
 */
export const getUserRole = () => {
  return localStorage.getItem('user_role');
};

/**
 * Get current user's ID
 * @returns {string|null} user ID or null
 */
export const getUserId = () => {
  return localStorage.getItem('user_id');
};

/**
 * Get current username
 * @returns {string|null} username or null
 */
export const getUsername = () => {
  return localStorage.getItem('username');
};

/**
 * Check if user can edit/delete a resource
 * @param {string} resourceType - 'customer', 'lead', or 'task'
 * @param {object} resource - the resource object
 * @returns {boolean} true if user can modify, false otherwise
 */
export const canModifyResource = (resourceType, resource) => {
  if (isAdmin()) {
    return true;
  }

  // Regular users cannot modify customers or leads
  if (resourceType === 'customer' || resourceType === 'lead') {
    return false;
  }

  // Regular users can only modify tasks assigned to them
  if (resourceType === 'task') {
    const userId = parseInt(getUserId());
    return resource.assigned_to === userId;
  }

  return false;
};

/**
 * Check if user can create a resource
 * @param {string} resourceType - 'customer', 'lead', or 'task'
 * @returns {boolean} true if user can create, false otherwise
 */
export const canCreateResource = (resourceType) => {
  if (isAdmin()) {
    return true;
  }

  // Regular users can only create tasks
  return resourceType === 'task';
};
