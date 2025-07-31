import React from 'react';
import Input from './Input';

export default function SearchComponent() {
  return (
    <Input
      id="search"
      label=""
      placeholder="Search..."
      onChange={() => {}}
      className="flex-grow"
    />
  );
}