import React from 'react';
import DropdownRadioMenu from '@/app/ui/dashboard/pagination/dropdown-radio-menu';

interface PageNumberSelectorProps {
  usersPerPage: number;
  onValueChange: (value: string) => void;
}

export default function PageNumberSelector({
  usersPerPage,
  onValueChange,
}: PageNumberSelectorProps) {
  const options = [
    { value: '5', label: '5' },
    { value: '10', label: '10 (Défaut)' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
  ];

  return (
    <DropdownRadioMenu
      labelButton={`${usersPerPage} par page`}
      labelDescription="Nombre d'utilisateurs par page"
      possibleValues={options}
      selectedValue={String(usersPerPage)}
      setValue={onValueChange}
    />
  );
}
