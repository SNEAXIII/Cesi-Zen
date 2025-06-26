'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IoChevronDownOutline } from 'react-icons/io5';

interface DropdownRadioMenu {
  labelButton: string;
  labelDescription: string;
  possibleValues: Record<string, string>[];
  selectedValue: string;
  setValue: (value: string) => void;
}

export default function DropdownRadioMenu({
  labelButton,
  labelDescription,
  possibleValues,
  selectedValue,
  setValue,
}: DropdownRadioMenu) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>{labelButton} <IoChevronDownOutline /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>{labelDescription}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={setValue}
        >
          {possibleValues.map((value) => (
            <DropdownMenuRadioItem
              key={value.value}
              value={value.value}
            >
              {value.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
