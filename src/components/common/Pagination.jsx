import React from 'react';
import { Box, Pagination as MuiPagination, Typography } from '@mui/material';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  loading = false 
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mt={3}
      flexWrap="wrap"
      gap={2}
    >
      <Typography variant="body2" color="text.secondary">
        Mostrando {startItem}-{endItem} de {totalItems} reservas
      </Typography>
      
      <MuiPagination 
        count={totalPages} 
        page={currentPage} 
        onChange={(event, page) => onPageChange(page)}
        disabled={loading}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        siblingCount={1}
        boundaryCount={1}
      />
    </Box>
  );
};

export default Pagination;
