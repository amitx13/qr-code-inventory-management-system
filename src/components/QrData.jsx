import axios from "axios";
import { useEffect, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import QRCode from "qrcode";
import { Link, useNavigate } from "react-router-dom";
import { authState } from './utils/authState'
import { useRecoilValue } from "recoil";



const QrData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrUrls, setQrUrls] = useState([]);
  const auth = useRecoilValue(authState);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/components/");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateQRCode = async (data) => {
    try {
      const url = await QRCode.toDataURL(data, {
        margin: 2,
        width: 150,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return url;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const generateQRCodesForItems = async () => {
      const promises = data.map(async (item) => {
        const qrUrl = await generateQRCode(JSON.stringify(item));
        return qrUrl;
      });

      const qrUrls = await Promise.all(promises);
      setQrUrls(qrUrls);
    };

    if (!loading) {
      generateQRCodesForItems();
    }
  }, [data, loading]);


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/components/${id}`);
      setData((prevData) => prevData.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="border border-blue-900 rounded-sm mx-4 sm:mx-8 lg:mx-14">
      <div className="grid grid-cols-1 lg:grid-cols-7 font-medium text-blue-900 text-base py-6 sm:py-8 lg:py-10 justify-items-center text-nowrap">
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">Name</div>
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">Data Received/Quantity</div>
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">Data Dispatched/Quantity</div>
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">Pending Items</div>
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">Status</div>
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">QR Code (Click to download)</div>
        <div className="hidden lg:text-wrap text-ellipsis lg:text-center lg:block lg:col-span-1">Admin Panel</div>
      </div>
      <div>
        {loading ? (
          "Loading..."
        ) : (
          data.map((item, index) => (
            <div key={item._id} className=" lg:grid lg:grid-cols-7 lg:justify-center lg:items-center flex flex-col justify-items-center text-nowrap items-baseline m-2 mb-10 ">
              <div className="flex  items-center justify-center">
                <div className="sm-item-label  font-medium text-lg lg:hidden">Name:</div>
                <div className="lg:col-span-1">{item.name}</div>
              </div>

              <div className="flex  items-center justify-center">
                <div className="sm-item-label flex font-medium text-lg lg:hidden">Data Received/Quantity : </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  {item.date.received_date ? new Date(item.date.received_date).toISOString().split("T")[0] : "N/A"}/{item.quantity.received_quantity}
                </div>
              </div>

              <div className="flex  items-center justify-center">
                <div className="sm-item-label flex font-medium text-lg lg:hidden">Data Dispatched/Quantity : </div>
                <div className="sm:col-span-2 lg:col-span-1">{item.date.dispatched_date
                  ? new Date(item.date.dispatched_date).toISOString().split("T")[0] : "-----------"}/{item.quantity.dispatched_quantity}
                </div>
              </div>

              < div className="flex  items-center justify-center">
                <div className="sm-item-label flex font-medium text-lg lg:hidden">Pending Items : </div>
                <div className="sm:col-span-2 lg:col-span-1">{(item.quantity.received_quantity - item.quantity.dispatched_quantity)}</div>
              </div>


              <div div className="flex  items-center justify-center">
                <div className="sm-item-label flex font-medium text-lg lg:hidden">Status : </div>
                <div className="sm:col-span-2 lg:col-span-1">{(item.quantity.received_quantity - item.quantity.dispatched_quantity) === 0 ? "Dispatched" : "Pending"}</div>
              </div>

              <div className="flex items-center justify-center ">
                <div className="sm-item-label flex font-medium text-lg lg:hidden">QR Code (Click to download) : </div>
                <div className=" lg:col-span-1 text-center">
                  {qrUrls[index] && (
                    <a href={qrUrls[index]} download={item._id} className="inline-block">
                      <img src={qrUrls[index]} alt="QR Code" className="mx-auto" />
                    </a>
                  )}
                </div>
              </div>


              <div div className="flex items-center justify-center">
                <div className="sm-item-label flex font-medium text-lg lg:hidden">Admin : </div>
                <div className="sm:col-span-2 lg:col-span-1 flex text-2xl">
                  <Link to={`/edit/${item._id}`}><MdEdit className="cursor-pointer m-3" /></Link>
                  {auth.isAuthenticated ? <MdDelete onClick={() => handleDelete(item._id)} className="cursor-pointer m-3" /> : <MdDelete onClick={() => navigate('/login')} className="cursor-pointer m-3" />}
                </div>
              </div>


            </div>
          ))
        )}
      </div>
    </div>

  );
};

export default QrData;
