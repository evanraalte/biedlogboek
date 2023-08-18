import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator


function App() {
  const [bids, setBids] = useState([]);
  const [inputText, setInputText] = useState('');
  const [parsedBids, setParsedBids] = useState([]);
  const [formData, setFormData] = useState({
    agentName: '',
  });

  const handleParse = () => {
    const lines = inputText.trim().split('\n');
    const parsedBids = [];
    const sessionUuid = uuidv4();
    for (let i = 0; i < lines.length; i += 10) {

      const amount = parseFloat(lines[i].match(/Bod € (\d+\.\d+),-/)[1].replace('.', ''));
      const timestamp = new Date(lines[i + 1]).getTime() / 1000;
      const financial_condition = lines[i + 4] === 'Financiële voorwaarde\nJa';
      const building_inspection_condition = lines[i + 6] === 'Voorwaarde bouwtechnische keuring\nJa';
      const personal_message = lines[i + 8] === 'Persoonlijke boodschap\nJa';

      parsedBids.push({
        id: sessionUuid,
        address: formData.address,
        listingPrice: formData.listingPrice,
        amount: amount,
        timestamp: timestamp,
        financial_condition: financial_condition,
        building_inspection_condition: building_inspection_condition,
        personal_message: personal_message,
        agentName: formData.agentName, // Add agent's name to each parsed bid
      });
    }

    setParsedBids(parsedBids);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send parsedBids to the backend
    const response = await fetch('/submit_bids/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedBids),
    });

    if (response.ok) {
      fetchBids();
    }
  };

  const fetchBids = async () => {
    const response = await fetch('/get_bids/');
    const bidsData = await response.json();
    setBids(bidsData);
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTextareaChange = (event) => {
    setInputText(event.target.value);
  };

  return (
    <div className="container mt-5">
      <h1>Bidding Platform</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="listingPrice" className="form-label">Listing price:</label>
          <input type="text" className="form-control" name="listingPrice" value={formData.listingPrice} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="agentName" className="form-label">Real Estate Agent Name:</label>
          <input type="text" className="form-control" name="agentName" value={formData.agentName} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address:</label>
          <input type="text" className="form-control" name="address" value={formData.address} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="biddingInfo" className="form-label">Paste Bidding Information:</label>
          <textarea className="form-control" rows="10" name="biddingInfo" value={inputText} onChange={handleTextareaChange}></textarea>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleParse}>Parse Data</button>
        <button type="submit" className="btn btn-success ml-2">Submit Bids</button>
      </form>

      <h2 className="mt-4">Parsed Bids Preview</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Amount</th>
            <th>Timestamp</th>
            <th>Financial Condition</th>
            <th>Building Inspection Condition</th>
            <th>Personal Message</th>
            <th>Agent Name</th>
            <th>Listing price</th>
            <th>UUID</th>

          </tr>
        </thead>
        <tbody>
          {parsedBids.map((bid, index) => (
            <tr key={index}>
              <td>{bid.address}</td>
              <td>€{bid.amount.toFixed(2)}</td>
              <td>{new Date(bid.timestamp * 1000).toLocaleString()}</td>
              <td>{bid.financial_condition ? 'Yes' : 'No'}</td>
              <td>{bid.building_inspection_condition ? 'Yes' : 'No'}</td>
              <td>{bid.personal_message ? 'Yes' : 'No'}</td>
              <td>{bid.agentName}</td>
              <td>€{bid.listingPrice}</td>
              <td>{bid.id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-4">Submitted Bids</h2>
      <ul className="list-group">
        {bids.map((bid, index) => (
          <li key={index} className="list-group-item">
            Amount: €{bid.amount.toFixed(2)} | Address: {bid.address}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
