"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import Link from "next/link";

async function getProduct(id) {
  console.log(id, "productidstart");

  try {
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);

    if (!response.ok) {
      throw new Error("Product not found");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(id, "inside async");

  useEffect(() => {
    async function fetchData() {
      const data = await getProduct(id);

      console.log(data, "product details");

      setProduct(data);
      setLoading(false);
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  console.log(product, "product state");

  const renderStars = (rate) => {
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="rating-stars" style={{ color: "#ffc107" }}>
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h3>Loading...</h3>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-4 py-md-5 text-center">
        <h2
          className="mb-3"
          style={{
            fontFamily: "Lato, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          }}
        >
          Product Not Found
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontFamily: "Lato, sans-serif",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          }}
        >
          The product you're looking for doesn't exist.
        </p>

        <Link href="/">
          <Button variant="outline-light" size="lg" className="mt-3">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Products
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4 py-lg-5">
      <Link href="/" className="d-inline-block mb-3 mb-md-4">
        <Button variant="outline-light" size="lg">
          <i className="fas fa-arrow-left me-2"></i>
          Back to Products
        </Button>
      </Link>

      <div className="product-detail-wrapper">
        <Row className="g-3 g-md-4">
          <Col xs={12} lg={6}>
            <div className="product-detail-image-wrapper">
              <img
                src={product.image}
                alt={product.title}
                className="product-detail-image"
                loading="lazy"
              />
            </div>
          </Col>

          <Col xs={12} lg={6}>
            <div className="product-detail-brand">
              {product.category?.split(" ")[0] || "Brand"}
            </div>

            <h1 className="product-detail-title">{product.title}</h1>

            <div className="mb-3">
              <Badge
                className="category-badge fs-6 px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
                  borderRadius: "30px",
                }}
              >
                {product.category}
              </Badge>
            </div>

            <div className="product-detail-price mb-3">
              {product.price.toFixed(2)}
            </div>

            {product.rating && (
              <div className="d-flex align-items-center gap-2 gap-md-3 mb-4">
                <div
                  style={{
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    color: "gold",
                  }}
                >
                  {renderStars(product.rating.rate)}
                </div>

                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "Lato, sans-serif",
                  }}
                >
                  <strong style={{ color: "#fff" }}>
                    {product.rating.rate}
                  </strong>{" "}
                  / 5 ({product.rating.count} reviews)
                </span>
              </div>
            )}

            <h5
              className="mt-3 mt-md-4 fw-semibold"
              style={{
                fontFamily: "Lato, sans-serif",
              }}
            >
              Description
            </h5>

            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.8,
              }}
            >
              {product.description}
            </p>

            <div
              className="mt-3 mt-md-4 pt-3"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Button
                variant="light"
                size="lg"
                className="px-4 px-md-5 py-2 fw-bold"
                style={{
                  borderRadius: "50px",
                }}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                Add to Cart
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
