import React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const ProgressIcon: React.FC<Props> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2.59008 12.8426C3.10678 14.1941 3.98335 15.3786 5.12489 16.2678C6.26642 17.1569 7.62944 17.7169 9.06637 17.887C10.5033 18.0572 11.9594 17.831 13.277 17.233C14.5946 16.6351 15.7236 15.688 16.5416 14.4945C17.3597 13.301 17.8357 11.9064 17.9181 10.4618C18.0005 9.01719 17.6861 7.57755 17.0091 6.29876C16.332 5.01996 15.3181 3.95073 14.077 3.20681C12.8359 2.4629 11.415 2.07265 9.968 2.07831L9.99903 10.0102L2.59008 12.8426Z"
      stroke="#C5C3FE"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="10.0001"
      cy="10"
      r="7.9319"
      transform="rotate(12.8759 10.0001 10)"
      stroke="#C5C3FE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="3 3"
    />
  </svg>
);

export default ProgressIcon;

