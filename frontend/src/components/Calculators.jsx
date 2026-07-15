import React, { useState } from 'react';
import { DollarSign, Calculator, HelpCircle } from 'lucide-react';

const Calculators = ({ defaultPrice = 2000 }) => {
  const [activeTab, setActiveTab] = useState('mortgage');

  // Mortgage State
  const [propertyPrice, setPropertyPrice] = useState(defaultPrice * 100); // Typical purchase value is 100x rent
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(30);

  // EMI State
  const [loanAmount, setLoanAmount] = useState(50000);
  const [emiRate, setEmiRate] = useState(7.5);
  const [emiTenure, setEmiTenure] = useState(5); // in years

  // Rent Affordability State
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [rentLimitPercent, setRentLimitPercent] = useState(30);

  // Math Calculations
  const calculateMortgage = () => {
    const principal = propertyPrice * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    if (monthlyRate === 0) return (principal / numberOfPayments).toFixed(2);
    const monthly =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return isNaN(monthly) ? 0 : monthly.toFixed(2);
  };

  const calculateEMI = () => {
    const monthlyRate = emiRate / 100 / 12;
    const numberOfPayments = emiTenure * 12;
    if (monthlyRate === 0) return (loanAmount / numberOfPayments).toFixed(2);
    const emi =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return isNaN(emi) ? 0 : emi.toFixed(2);
  };

  const calculateRentAffordability = () => {
    return (monthlyIncome * (rentLimitPercent / 100)).toFixed(2);
  };

  return (
    <div className="card border-0 glass-panel shadow p-4 rounded-4 my-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Calculator className="text-primary" />
        <h4 className="m-0 fw-bold">Financial Toolkits</h4>
      </div>

      {/* Tabs Menu */}
      <ul className="nav nav-pills mb-4 gap-2 bg-light p-1 rounded-3">
        <li className="nav-item flex-fill">
          <button
            className={`nav-link w-100 rounded-3 border-0 py-2 small fw-semibold text-center ${activeTab === 'mortgage' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('mortgage')}
          >
            Mortgage
          </button>
        </li>
        <li className="nav-item flex-fill">
          <button
            className={`nav-link w-100 rounded-3 border-0 py-2 small fw-semibold text-center ${activeTab === 'emi' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('emi')}
          >
            EMI Loan
          </button>
        </li>
        <li className="nav-item flex-fill">
          <button
            className={`nav-link w-100 rounded-3 border-0 py-2 small fw-semibold text-center ${activeTab === 'rent' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('rent')}
          >
            Rent Checker
          </button>
        </li>
      </ul>

      {/* Mortgage Calculator Tab */}
      {activeTab === 'mortgage' && (
        <div>
          <h5 className="fw-bold mb-3">Mortgage Payment Estimator</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Home Value (₹)</label>
              <input
                type="number"
                className="form-control rounded-3"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Down Payment ({downPaymentPercent}%)</label>
              <input
                type="range"
                className="form-range"
                min="5"
                max="80"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Interest Rate ({interestRate}%)</label>
              <input
                type="range"
                className="form-range"
                min="1"
                max="15"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Loan Duration ({loanTerm} years)</label>
              <select
                className="form-select rounded-3"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
              >
                <option value={10}>10 Years</option>
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={30}>30 Years</option>
              </select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
            <span className="fw-semibold text-secondary">Estimated Monthly Payment:</span>
            <span className="fs-4 fw-extrabold text-primary">₹{calculateMortgage()}</span>
          </div>
        </div>
      )}

      {/* EMI Calculator Tab */}
      {activeTab === 'emi' && (
        <div>
          <h5 className="fw-bold mb-3">General Loan EMI Calculator</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Loan Principal Amount (₹)</label>
              <input
                type="number"
                className="form-control rounded-3"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Interest Rate ({emiRate}%)</label>
              <input
                type="range"
                className="form-range"
                min="2"
                max="20"
                step="0.1"
                value={emiRate}
                onChange={(e) => setEmiRate(Number(e.target.value))}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label small fw-semibold text-secondary">Loan Term ({emiTenure} years)</label>
              <input
                type="range"
                className="form-range"
                min="1"
                max="30"
                value={emiTenure}
                onChange={(e) => setEmiTenure(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
            <span className="fw-semibold text-secondary">Equated Monthly Installment (EMI):</span>
            <span className="fs-4 fw-extrabold text-primary">₹{calculateEMI()}</span>
          </div>
        </div>
      )}

      {/* Rent Checker Tab */}
      {activeTab === 'rent' && (
        <div>
          <h5 className="fw-bold mb-3">Affordable Rent Index</h5>
          <p className="text-secondary small">
            Determine your suggested maximum rental budget based on the standard 30% financial rule.
          </p>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Gross Monthly Income (₹)</label>
              <input
                type="number"
                className="form-control rounded-3"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Target Budget Allocation ({rentLimitPercent}%)</label>
              <input
                type="range"
                className="form-range"
                min="15"
                max="50"
                value={rentLimitPercent}
                onChange={(e) => setRentLimitPercent(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
            <span className="fw-semibold text-secondary">Recommended Max Budget:</span>
            <span className="fs-4 fw-extrabold text-success">₹{calculateRentAffordability()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculators;
