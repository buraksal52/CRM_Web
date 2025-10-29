import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon,
  iconBgColor = 'bg-blue-100 dark:bg-blue-900',
  iconColor = 'text-blue-600 dark:text-blue-300',
  borderColor = 'border-blue-500 dark:border-blue-400',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseClasses = "bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden transition-all duration-200";
  const hoverClasses = hoverable ? "hover:shadow-lg dark:hover:shadow-gray-900/80 hover:scale-105 cursor-pointer" : "";
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className={`border-l-4 ${borderColor} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {icon && (
              <div className={`${iconBgColor} p-3 rounded-full`}>
                <div className={`w-6 h-6 ${iconColor}`}>
                  {icon}
                </div>
              </div>
            )}
          </div>
          {children && <div className="mt-4">{children}</div>}
        </div>
      )}
      {!title && !icon && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
