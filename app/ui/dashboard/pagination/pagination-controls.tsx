import React from 'react';
import { Button } from '@/components/ui/button';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { LuChevronFirst, LuChevronLast } from 'react-icons/lu';
import PageNumberSelector from '@/app/ui/dashboard/pagination/page-number-selector';
import { GrPowerReset } from 'react-icons/gr';

interface PaginationControlsProps {
  currentPage: number;
  totalPage: number;
  usersPerPage: number;
  canReset: boolean;
  onUserPerPageChange: (value: string) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onResetPagination: () => void;
}

export default function PaginationControls({
  currentPage,
  totalPage,
  usersPerPage,
  canReset,
  onUserPerPageChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onResetPagination,
}: PaginationControlsProps) {
  return (
    <div className='flex flex-col lg:flex-row gap-1 sm:gap-3'>
      <div className='flex justify-center lg:justify-start items-center flex-wrap gap-1 sm:gap-3 w-full sm:w-auto'>
        <Button
          onClick={onFirstPage}
          disabled={currentPage <= 1}
          variant='outline'
        >
          <LuChevronFirst />
        </Button>
        <Button
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
          variant='outline'
        >
          <IoChevronBackOutline />
        </Button>
        <p className='flex-1 items-center justify-center text-center w-28 text-sm sm:text-base'>
          Page {!totalPage ? 0 : currentPage}/{totalPage}
        </p>
        <Button
          onClick={onNextPage}
          disabled={currentPage >= totalPage}
          variant='outline'
        >
          <IoChevronForwardOutline />
        </Button>
        <Button
          onClick={onLastPage}
          disabled={currentPage >= totalPage}
          variant='outline'
        >
          <LuChevronLast />
        </Button>
      </div>
      <div className='flex justify-center lg:justify-start items-center flex-wrap gap-1 sm:gap-3 w-full sm:w-auto'>
        <PageNumberSelector
          usersPerPage={usersPerPage}
          onValueChange={onUserPerPageChange}
        />
        <Button
          onClick={onResetPagination}
          disabled={!canReset}
          variant='outline'
        >
          Réinitialisation <GrPowerReset />
        </Button>
      </div>
    </div>
  );
}
