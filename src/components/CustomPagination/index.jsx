import { memo } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'react-bootstrap';

const DynamicPagination = ({
  totalItems,
  itemsPerPage,
  onPageChange,
  activePage,
  maxPagesToShow = 3,
}) => {
  // const [activePage, setActivePage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    // setActivePage(pageNumber);
    onPageChange(pageNumber);
  };

  const renderPaginationItems = () => {
    const pages = [];
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(activePage - halfRange, 1);
    let endPage = Math.min(activePage + halfRange, totalPages);

    if (activePage <= halfRange) {
      endPage = Math.min(maxPagesToShow, totalPages);
    } else if (activePage + halfRange >= totalPages) {
      startPage = Math.max(totalPages - maxPagesToShow + 1, 1);
    }

    // Add "Previous" page button
    if (startPage > 1) {
      pages.push(
        <Pagination.Item key='start-ellipsis' disabled>
          ...
        </Pagination.Item>,
      );
    }

    // Add page numbers
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={page === activePage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>,
      );
    }

    // Add "Next" ellipsis button
    if (endPage < totalPages) {
      pages.push(
        <Pagination.Item key='end-ellipsis' disabled>
          ...
        </Pagination.Item>,
      );
    }

    return pages;
  };

  return (
    <div className='d-flex justify-content-center mt-3'>
      <Pagination size='sm'>
        <Pagination.First onClick={() => handlePageChange(1)} disabled={activePage === 1} />
        <Pagination.Prev
          onClick={() => handlePageChange(activePage - 1)}
          disabled={activePage === 1}
        />
        {renderPaginationItems()}
        <Pagination.Next
          onClick={() => handlePageChange(activePage + 1)}
          disabled={activePage === totalPages}
        />
        <Pagination.Last
          onClick={() => handlePageChange(totalPages)}
          disabled={activePage === totalPages}
        />
      </Pagination>
    </div>
  );
};

DynamicPagination.propTypes = {
  totalItems: PropTypes.number.isRequired,
  activePage: PropTypes.number,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxPagesToShow: PropTypes.number, // Default is 5
};

export default memo(DynamicPagination);
