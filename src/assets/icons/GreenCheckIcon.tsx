import React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const GreenCheckIcon: React.FC<Props> = (props) => (
  <svg
    width="13"
    height="10"
    viewBox="0 0 13 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M1 4L4.50024 8L12.0002 1" stroke="#55D47D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default GreenCheckIcon;

