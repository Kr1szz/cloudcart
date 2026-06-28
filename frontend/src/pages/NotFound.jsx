import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page text-center py-5 my-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <i className="bi bi-cloud-slash text-primary display-1 mb-4 d-inline-block"></i>
            <h1 className="display-4 fw-bold font-title">404 - Page Not Found</h1>
            <p className="text-muted fs-5 leading-relaxed mb-4">
              The page you are looking for does not exist. Check the URL or return to the homepage.
            </p>
            <Link to="/" className="btn btn-primary-custom btn-lg">
              <i className="bi bi-house-door me-2"></i> Go to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
