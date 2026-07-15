import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import { Filter, SlidersHorizontal, Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const locationObj = useLocation();

  // Extract query params on load
  const getQueryParam = (param) => {
    const params = new URLSearchParams(locationObj.search);
    return params.get(param) || '';
  };

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [city, setCity] = useState(getQueryParam('city'));
  const [type, setType] = useState(getQueryParam('type'));
  const [purpose, setPurpose] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [parking, setParking] = useState('');
  const [petsAllowed, setPetsAllowed] = useState('');
  const [furnished, setFurnished] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Trigger search on parameter/filter changes
  useEffect(() => {
    fetchProperties();
  }, [city, type, purpose, minPrice, maxPrice, bedrooms, bathrooms, parking, petsAllowed, furnished, sortBy, locationObj.search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Build query string
      let queryStr = `?city=${city}&type=${type}&purpose=${purpose}&sortBy=${sortBy}`;
      if (minPrice) queryStr += `&minPrice=${minPrice}`;
      if (maxPrice) queryStr += `&maxPrice=${maxPrice}`;
      if (bedrooms) queryStr += `&bedrooms=${bedrooms}`;
      if (bathrooms) queryStr += `&bathrooms=${bathrooms}`;
      if (parking) queryStr += `&parking=${parking}`;
      if (petsAllowed) queryStr += `&petsAllowed=${petsAllowed}`;
      if (furnished) queryStr += `&furnished=${furnished}`;

      const res = await axios.get(`/properties${queryStr}`);
      setProperties(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setCity('');
    setType('');
    setPurpose('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setParking('');
    setPetsAllowed('');
    setFurnished('');
    setSortBy('newest');
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card glass-panel border p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" /> Filters
              </h5>
              <button onClick={clearFilters} className="btn btn-sm btn-link text-decoration-none p-0 text-primary">
                Clear All
              </button>
            </div>

            {/* City */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">City Location</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Purpose */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Listing Purpose</label>
              <select
                className="form-select rounded-3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option value="">Any (Rent & Buy)</option>
                <option value="Rent">For Rent</option>
                <option value="Sale">For Sale</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Property Type</label>
              <select
                className="form-select rounded-3"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="House">House</option>
                <option value="Hostel">Hostel</option>
                <option value="PG">PG</option>
                <option value="Office">Office</option>
                <option value="Land">Land</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Budget Limits ($)</label>
              <div className="d-flex gap-2">
                <input
                  type="number"
                  className="form-control rounded-3"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control rounded-3"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Rooms counts */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Bedrooms</label>
              <select
                className="form-select rounded-3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>

            {/* Bathrooms count */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Bathrooms</label>
              <select
                className="form-select rounded-3"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3">3+ Baths</option>
              </select>
            </div>

            {/* Amenities Boolean Checkboxes */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary d-block">Amenities</label>
              
              <div className="form-check form-check-inline mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="parkingCheck"
                  checked={parking === 'true'}
                  onChange={(e) => setParking(e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label small" htmlFor="parkingCheck">Parking</label>
              </div>

              <div className="form-check form-check-inline mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="petsCheck"
                  checked={petsAllowed === 'true'}
                  onChange={(e) => setPetsAllowed(e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label small" htmlFor="petsCheck">Pets Allowed</label>
              </div>

              <div className="form-check form-check-inline mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="furnishedCheck"
                  checked={furnished === 'true'}
                  onChange={(e) => setFurnished(e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label small" htmlFor="furnishedCheck">Furnished</label>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="col-lg-9">
          {/* Header Controls */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 bg-white p-3 rounded-4 border shadow-sm">
            <h5 className="m-0 fw-bold text-dark d-flex align-items-center gap-2">
              <SearchIcon size={18} className="text-primary" />
              Found: {properties.length} Listings
            </h5>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-secondary text-nowrap">Sort By:</span>
              <select
                className="form-select form-select-sm rounded-pill"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="newest">Newest</option>
                <option value="lowestPrice">Price: Low to High</option>
                <option value="highestPrice">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="col-md-4">
                  <div className="card glass-card p-3">
                    <div className="skeleton skeleton-image mb-3"></div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-5 glass-panel border rounded-4">
              <span className="fs-1 d-block mb-3">🔍</span>
              <h4 className="fw-bold">No Properties Found</h4>
              <p className="text-secondary small">Try adjusting your locations or price filters to broaden your search results.</p>
              <button onClick={clearFilters} className="btn btn-primary rounded-pill btn-sm px-4">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {properties.map((item) => (
                <div key={item._id} className="col-md-6 col-lg-4">
                  <PropertyCard property={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
