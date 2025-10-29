import toast from 'react-hot-toast';

/**
 * Custom toast notification helpers with consistent styling
 */

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    style: {
      background: '#059669',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    style: {
      background: '#dc2626',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: '500',
    },
  });
};

export const showWarning = (message) => {
  toast(message, {
    duration: 3500,
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: '500',
    },
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    style: {
      background: '#4b5563',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: '500',
    },
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const dismissAll = () => {
  toast.dismiss();
};
