"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Badge,
  Pagination,
} from "react-bootstrap";
import Link from "next/link";
import ProductSkeleton from "../components/ProductSkeleton";

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    fetch("https://fakestoreapi.com/products")
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
        setFilteredProducts(data);
        setLoading(false);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, [itemsPerPage]);

  // Filter products
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(allProducts);
      setCurrentPage(1);
      setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = allProducts.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
      setCurrentPage(1);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, allProducts, itemsPerPage]);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStars = (rate) => {
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <span className="rating-stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />,
    );

    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1)
      ) {
        items.push(
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>,
        );
      } else if (
        (page === 2 && currentPage > 3) ||
        (page === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} />);
      }
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />,
    );

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  const currentItems = getCurrentPageItems();

  // Show skeleton while loading or searching
  if (loading || isSearching) {
    return (
      <Container className="py-5">
        <h1 className="text-center mb-4 display-4 fw-bold">Our Products</h1>
        <p className="text-center text-muted mb-4">
          Click on any product to view details
        </p>

        <div className="search-bar-container">
          <div className="skeleton-search-bar"></div>
        </div>

        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {[...Array(8)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4 display-4 fw-bold">Our Products</h1>
      <p className="text-center text-muted mb-4">
        Click on any product to view details
      </p>

      <div className="search-bar-container">
        <Form.Control
          type="text"
          placeholder="🔍 Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="lg"
          className="shadow-sm"
        />
        {searchTerm && (
          <small className="text-muted d-block text-center mt-2">
            {filteredProducts.length} products found
          </small>
        )}
      </div>

      <div className="text-muted text-center mb-3">
        Showing {currentItems.length} of {filteredProducts.length} products
        {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {currentItems.length === 0 ? (
          <Col className="text-center py-5">
            <h3 className="text-muted">No products found</h3>
            <p className="text-muted">Try adjusting your search terms</p>
          </Col>
        ) : (
          currentItems.map((product) => (
            <Col key={product.id}>
              <Link
                href={`/product/${product.id}`}
                style={{ textDecoration: "none" }}
              >
                <Card className="product-card h-100">
                  <div className="product-image-container">
                    <Card.Img
                      variant="top"
                      src={product.image}
                      alt={product.title}
                      className="product-image"
                    />
                  </div>
                  <Card.Body>
                    {/* Brand */}
                    <div className="product-brand">
                      {product.category.split(" ")[0] || "Brand"}
                    </div>

                    {/* Product Title */}
                    <Card.Title className="product-title">
                      {product.title}
                    </Card.Title>

                    {/* Category */}
                    <div className="product-category">{product.category}</div>

                    {/* Price */}
                    <div className="product-price">
                      ${product.price.toFixed(2)}
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="product-rating">
                        <span>{renderStars(product.rating.rate)}</span>
                        <span className="rating-count">
                          ({product.rating.count})
                        </span>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))
        )}
      </Row>

      {renderPagination()}
    </Container>
  );
}
