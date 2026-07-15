import { Card, Col } from 'react-bootstrap';

export default function ProductSkeleton() {
  return (
    <Col xs={12} sm={6} md={4} lg={3} className="mb-3 mb-sm-4">
      <Card className="product-card h-100" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
        <div className="product-image-container skeleton">
          <div className="skeleton-image"></div>
        </div>
        <Card.Body>
          <div className="skeleton-brand"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-price"></div>
          <div className="skeleton-rating"></div>
        </Card.Body>
      </Card>
    </Col>
  );
}