import React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const DropdownIcon: React.FC<Props> = (props) => (
  <svg
    width="12"
    height="9"
    viewBox="0 0 12 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M6 9L11.1962 0H0.803848L6 9Z" fill="black" />
  </svg>
);

export default DropdownIcon;

