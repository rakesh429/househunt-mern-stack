import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-lg-4 mb-4">
            <h5 className="fw-bold text-white mb-3">🏠 HouseHunt</h5>
            <p className="text-secondary small">
              A comprehensive premium rent management system designed to connect tenants and landlords seamlessly. Experience transparency, ease, and real-time interaction in property searches.
            </p>
          </div>
          <div className="col-6 col-md-3 col-lg-2 mb-4">
            <h6 className="text-white fw-bold mb-3">Company</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press Release</li>
              <li>Contact Support</li>
            </ul>
          </div>
          <div className="col-6 col-md-3 col-lg-2 mb-4">
            <h6 className="text-white fw-bold mb-3">Legal</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Refund Terms</li>
              <li>Disclaimers</li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="small text-secondary">
            &copy; {new Date().getFullYear()} HouseHunt Inc. All rights reserved.
          </div>
          <div className="d-flex gap-3 small text-secondary">
            <span>English (US)</span>
            <span>USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
