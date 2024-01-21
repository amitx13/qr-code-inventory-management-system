import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const GenerateQrCode = () => {

  return (
    <div className="w-screen flex items-center justify-center">
      <div className="shadow-xl rounded-md flex flex-col items-center justify-center">
        <div className="font-medium text-blue-900 text-2xl py-7 ">Generate QR Code</div>
        <GenerateQr />
      </div>
    </div>
  )
}
export default GenerateQrCode




function GenerateQr() {
  const [selectedValue, setSelectedValue] = useState('Select (C1-C5)');
  const [date, setData] = useState('')
  const [quantity, setQuantity] = useState(0);
  const navigate = useNavigate();

  async function Generate() {
    try {
      await axios.post('http://localhost:3000/api/components/', {
        name: selectedValue,
        received_quantity: quantity,
        received_date: date
      });
      navigate('/')
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  }

  return (
    <div className="flex-col flex w-23-rem text-xl mx-10">
      <label htmlFor="name" className="text-gray-500 text-lg font-medium">Name</label>
      <select className="border border-gray-300 px-3 py-1 my-3" value={selectedValue} onChange={(e) => { setSelectedValue(e.target.value) }}>
        <option disabled hidden value="Select (C1-C5)">
          Select (C1-C5)
        </option>
        <option value="c1">c1</option>
        <option value="c2">c2</option>
        <option value="c3">c3</option>
        <option value="c4">c4</option>
        <option value="c5">c5</option>
      </select>
      <label htmlFor="Date" className="text-gray-500 text-lg font-medium">Date</label>
      <input className="border border-gray-300 px-2 py-1 my-3" onChange={(e) => { setData(e.target.value) }} type="date" max={(new Date()).toISOString().split('T')[0]} />
      <label htmlFor="Quantity" className="text-gray-500 text-lg font-medium">Quantity</label>
      <input className="border border-gray-300 px-2 py-1 my-3" onChange={(e) => { setQuantity(e.target.value) }} type="number" name="" id="" />
      <button className="border-blue-800 border bg-blue-900 text-white text-xl py-2 px-9 mt-6 rounded-sm font-medium  mb-24" onClick={Generate} >Generate QR</button>
    </div>
  );
}
