import React from 'react';

interface ParallelogramProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const Parallelogram: React.FC<ParallelogramProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  return (
    <div className={`parallelogram ${wrapperClassName}`} {...props}>
      <div className={`parallelogram-content ${className}`}>
        {children}
      </div>
    </div>
  );
};
