'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Pagination } from 'react-bootstrap';
import Link from 'next/link';
import ProductSkeleton from './components/ProductSkeleton';

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputRef = useRef(null);

  // Exchange rate: 1 USD = 83 INR
  const USD_TO_INR = 83;

  const convertToINR = (usdPrice) => {
    return (usdPrice * USD_TO_INR).toFixed(2);
  };

  // Fetch products
  useEffect(() => {
    setLoading(true);
    fetch('https://fakestoreapi.com/products')
      .then(response => response.json())
      .then(data => {
        setAllProducts(data);
        setFilteredProducts(data);
        setLoading(false);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, [itemsPerPage]);

  // Filter products with debounce
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setFilteredProducts(allProducts);
      setCurrentPage(1);
      setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = allProducts.filter((product) =>
        product.title.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
      setFilteredProducts(filtered);
      setCurrentPage(1);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, allProducts, itemsPerPage]);

  const getCurrentPageItems = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredProducts]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const renderStars = (rate) => {
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <span className="rating-stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return (
        <div className="pagination-wrapper">
          <div className="pagination-info">
            Showing all {filteredProducts.length} products
          </div>
        </div>
      );
    }

    let items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return (
      <div className="pagination-wrapper">
        <div className="pagination-container">
          <Pagination className="pagination-modern">{items}</Pagination>
          <div className="pagination-info">
            Page {currentPage} of {totalPages} • {filteredProducts.length} products total
          </div>
        </div>
      </div>
    );
  };

  const currentItems = getCurrentPageItems();

  // Loading skeleton
  if (loading) {
    return (
      <Container className="py-3 py-md-4 py-lg-5">
        <h1 className="text-center mb-2 display-4 fw-bold" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
          Our Products
        </h1>
        <p className="text-center mb-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Lato, sans-serif', fontWeight: 300, fontSize: 'clamp(0.85rem, 2vw, 1.1rem)' }}>
          Click on any product to view details
        </p>
        
        <div className="search-wrapper">
          <div className="search-bar-container">
            <span className="search-icon"><i className="fas fa-search"></i></span>
            <div className="skeleton-search-bar" style={{ height: 'clamp(44px, 6vw, 56px)', width: '100%', borderRadius: '60px' }}></div>
          </div>
        </div>
        
        <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-sm-4">
          {[...Array(8)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4 py-lg-5">
      <h1 className="text-center mb-2 display-4 fw-bold" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>
        Our Products
      </h1>
      <p className="text-center mb-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Lato, sans-serif', fontWeight: 300, fontSize: 'clamp(0.85rem, 2vw, 1.1rem)' }}>
        Click on any product to view details
      </p>

      {/* BLACK SEARCH BAR */}
      <div className="search-wrapper">
        <div className="search-bar-container" style={{
          background: '#1a1a1a',
          border: '2px solid #333333',
          borderRadius: '60px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <span className="search-icon" style={{
            position: 'absolute',
            left: '22px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '1rem',
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'color 0.3s ease'
          }}>
            <i className="fas fa-search"></i>
          </span>
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            aria-label="Search products"
            style={{
              width: '100%',
              padding: '14px 55px 14px 56px',
              fontSize: '1rem',
              height: '56px',
              borderRadius: '60px',
              border: 'none',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: 'none'
            }}
            onFocus={(e) => {
              e.target.parentElement.style.borderColor = '#6366f1';
              e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4)';
              e.target.parentElement.querySelector('.search-icon').style.color = '#6366f1';
            }}
            onBlur={(e) => {
              e.target.parentElement.style.borderColor = '#333333';
              e.target.parentElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
              e.target.parentElement.querySelector('.search-icon').style.color = 'rgba(255,255,255,0.4)';
            }}
          />
          
          {searchTerm && (
            <button 
              className="search-clear-btn"
              onClick={clearSearch}
              aria-label="Clear search"
              type="button"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div className="search-results-wrapper" style={{ marginTop: '20px' }}>
          <span className="search-results-count" style={{ 
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.85rem',
            fontFamily: 'Lato, sans-serif'
          }}>
            {searchTerm ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found` : `${allProducts.length} products available`}
          </span>
        </div>
      </div>

      <div className="text-center mb-3" style={{ 
        color: 'rgba(255,255,255,0.2)', 
        fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
        fontFamily: 'Lato, sans-serif',
        fontWeight: 300,
        letterSpacing: '0.5px'
      }}>
        Showing {currentItems.length} of {filteredProducts.length} products
        {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
      </div>

      <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-sm-4">
        {currentItems.length === 0 ? (
          <Col xs={12} className="text-center">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '400px',
              width: '100%'
            }}>
              <h3 style={{ 
                color: 'rgba(255,255,255,0.3)', 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 700,
                fontSize: '1.8rem'
              }}>
                No Products Found
              </h3>
            </div>
          </Col>
        ) : (
          currentItems.map((product) => (
            <Col key={product.id}>
              <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <Card className="product-card h-100">
                  <div className="product-image-container">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                    <button 
                      className="wishlist-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Added "${product.title}" to wishlist!`);
                      }}
                      aria-label="Add to wishlist"
                    >
                      <i className="far fa-heart"></i>
                    </button>
                  </div>
                  
                  <Card.Body>
                    <div className="product-brand">
                      {product.category.split(' ')[0] || 'Brand'}
                    </div>
                    <Card.Title className="product-title">
                      {product.title}
                    </Card.Title>
                    <div className="product-category">
                      {product.category}
                    </div>
                    <div className="product-price">
                      ₹{convertToINR(product.price)}
                    </div>
                    {product.rating && (
                      <div className="product-rating">
                        <span>{renderStars(product.rating.rate)}</span>
                        <span className="rating-count">
                          ({product.rating.count})
                        </span>
                      </div>
                    )}
                  </Card.Body>
                  
                  <button 
                    className="quick-add-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Added "${product.title}" to cart!`);
                    }}
                    aria-label="Quick add to cart"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </Card>
              </Link>
            </Col>
          ))
        )}
      </Row>

      <div className="pagination-wrapper">
        {renderPagination()}
      </div>
    </Container>
  );
}