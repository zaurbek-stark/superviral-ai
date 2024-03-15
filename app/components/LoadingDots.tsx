import React from 'react';

type Props = {
  isLoading: boolean;
}

const LoadingDots: React.FC<Props> = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className="dots">
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingDots;