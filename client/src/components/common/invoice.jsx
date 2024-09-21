import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import numWords from "num-words";

// Invoice Component
const InvoiceCx = ({ invoiceData, staticData }) => {
  const invoiceAmountInWords = numWords(invoiceData.amount).toUpperCase();
  const {
    logoSrc,
    companyName,
    companyAddress,
    companyContact,
    gstNumber,
    bankDetails,
  } = staticData
  return (
    <div id="invoice" className="max-w-4xl mx-auto p-4 border border-gray-300 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center">
          <img src={logoSrc} alt={`${companyName} Logo`} className="w-40 h-24 mb-4 sm:mb-0 sm:mr-4" />
          <div className="text-center sm:text-left sm:ml-24">
            <h1 className="text-xl font-bold">{companyName}</h1>
            <p>{companyAddress}</p>
            <p>PH: {companyContact}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-right font-bold">GST: {gstNumber}</p>
        </div>
      </div>
  
      {/* Customer Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4 mb-4">
        <div>
          <p>TO: {invoiceData.firstName} {invoiceData.lastName}</p>
          <p>ADDRESS: {invoiceData.shippingDetails.address}</p>
          <p>PH: {invoiceData.contactNumber}</p>
        </div>
        <div className="text-left sm:text-right">
          <p>Bill No: {invoiceData._id}</p>
          <p>Date: {new Date(invoiceData.createdAt).toLocaleDateString()}</p>

        </div>
      </div>
  
      {/* Items Table */}
      <div className="border-b pb-4 mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 font-semibold">S.No</th>
              <th className="border p-2 font-semibold">Items</th>
              <th className="border p-2 font-semibold">HSN Code</th>
              <th className="border p-2 font-semibold">Qty</th>
              <th className="border p-2 font-semibold">Mrp</th>
              <th className="border p-2 font-semibold">Rate</th>
              <th className="border p-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
          {invoiceData.cart2 && invoiceData.cart2.length > 0 ? (
  invoiceData.cart2.map((item, index) => (
    <tr key={index}>
      <td className="border p-2">{index + 1}</td>
      <td className="border p-2">
        {item.name}
        <br />
        IMEI:
      </td>
      <td className="border p-2"></td>
      <td className="border p-2">{item.quantity}</td>
      <td className="border p-2">{item.price}</td>
      <td className="border p-2">{item.discounted_price}</td>
      <td className="border p-2">{item.discounted_price}</td>
    </tr>
  ))
) : invoiceData.product ? (
  
    <tr>
      <td className="border p-2">{1}</td>
      <td className="border p-2">
        {invoiceData.name}
        <br />
        IMEI:
      </td>
      <td className="border p-2"></td>
      <td className="border p-2">1</td>
      <td className="border p-2">₹{invoiceData.price}</td>
      <td className="border p-2">₹{invoiceData.price}</td>
      <td className="border p-2">₹{invoiceData.discounted_price}</td>
    </tr>
  
) : (
  <tr>
    <td colSpan="7" className="border p-2 text-center">No items found</td>
  </tr>
)}

          </tbody>
        </table>
      </div>
  
      {/* Summary */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
          <p>Tot. Qty: {invoiceData.quantity}</p>
          <p>Amount in Words: {invoiceAmountInWords}</p>
          <p>Payment Method: {invoiceData.paymentMethod}</p>
          <p className="text-xs mt-4">
            *Goods once sold will not be exchanged or returned.
            <br />
            *Service will be provided by Authorised Service Center only.
          </p>
        </div>
        <div className="w-full sm:w-1/3">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="p-2 font-semibold">Gross Amount :</td>
                <td className="p-2">{invoiceData.subtotal}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Tot Disc Amt :</td>
                <td className="p-2">{invoiceData.discount}</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Net Amount :</td>
                <td className="p-2 font-bold">{invoiceData.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      {/* Bank Details */}
      <div className="border-t pt-4">
        <p>BANK DETAILS:</p>
        <p>BANK: {bankDetails.bankName}</p>
        <p>ACC No.: {bankDetails.accountNumber}</p>
        <p>IFSC Code: {bankDetails.ifscCode}</p>
        <p>Address: {bankDetails.bankAddress}</p>
      </div>
    </div>
  );
  
};

// Main App Component
// Main App Component
const Invoice = () => {
  const { orderid } = useParams();
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user || (!user.email && !user.contactNumber)) {
          console.log('User not logged in or incomplete user details');
          navigate('/login');
          return;
        }

        // Only fetch from getbuy
        const buyNowOrdersResponse = await axios.get(`${apiUrl}/api/users/getbuy`, {
          params: {
            email: user.email,
            contactNumber: user.contactNumber,
          },
        });

        setInvoiceData(buyNowOrdersResponse.data.orders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
        setError('Error fetching order');
      }
    };

    fetchOrder();
  }, [orderid, navigate]);

  const specificInvoice = invoiceData.find(order => order._id === orderid);
  
  const generatePDF = async (invoicedata) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const element = document.getElementById('invoice');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Convert PDF to base64 string
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    // Send PDF to backend
    axios.post(`${apiUrl}/send-invoice`, {
      email: invoicedata.email,
      pdfBuffer: pdfBase64,
    })
      .then(response => {
        console.log('Email sent successfully', response.data);
      })
      .catch(error => {
        console.error('Error sending email:', error);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const invoicestaticData = {
    companyAddress: "3, Sukanta Sarani, Durgapur",
    companyContact: "9876543210",
    gstNumber: "19AAQWE43567YHJ",
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    billNumber: "CA/575",
    invoiceDate: "",
    items: [
      {
        name: "",
        imei: "",
        hsnCode: "",
        quantity: 1,
        mrp: "",
        rate: "",
        amount: "",
      },
    ],
    totalItems: "",
    totalQuantity: 1,
    grossAmount: "",
    discountAmount: "",
    netAmount: "",
    amountInWords: "",
    paymentMethod: "",
    bankDetails: {
      bankName: "ICICI BANK",
      accountNumber: "713229201",
      ifscCode: "ICIC0000188",
      bankAddress: "Durgapur",
    },
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <InvoiceCx invoiceData={specificInvoice} staticData={invoicestaticData} />

        <button
          onClick={() => generatePDF(specificInvoice)}
          className="bg-black hover:bg-gray-500 text-white px-4 py-2 mt-4 w-full sm:w-auto text-center"
        >
          Send Invoice via Email
        </button>
      </div>
    </div>
  );
};

export default Invoice;