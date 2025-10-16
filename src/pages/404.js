// pages/404.js
import { ROUTES } from '@/utils/constant';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function Custom404() {
    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '100vh' }}
        >
            <Row>
                <Col className="text-center">
                    <h1 className="display-4">404 - Page Not Found</h1>
                    <p className="lead">
                        Oops! The page you are looking for does not exist or has been moved.
                    </p>
                    <Button
                        variant="primary"
                        as={Link} // Render the Button as a Next.js Link
                        href={ROUTES.home || '/'} // Use ROUTES.home if defined, otherwise fallback to '/'
                    >
                        Go Back to Homepage
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}