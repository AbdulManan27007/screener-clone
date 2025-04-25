import React, { useEffect, useState } from "react";
import TransactionTable from "../components/TransactionsTable";
import TabbedTables from "../components/TabbedTables";
import MarketInfo from "../components/MarketInfo";
import ChartExample from "../components/TradingViewWidget"; 
import { fetchSingleToken } from "../utils/api";
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import io from "socket.io-client";
import CarLeaderboard from '../components/headercrousal';

const socket = io(import.meta.env.VITE_API_URL);

const TradingChart = () => {
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);
  const { pairAddress } = useParams();

  const getTokenData = async () => {
    setLoading(true);
    try {
      const data = await fetchSingleToken(pairAddress);
      setToken(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTokenData();

    socket.on("token", (updatedToken) => {
      if (updatedToken.pairAddress === pairAddress) {
        // console.log("Received updated token data:", updatedToken);
        setToken(updatedToken);
      }
    });

    return () => {
      socket.off("token");
    };
  }, [pairAddress]);

  const dummyData = [
    { id: 2, name: 'ALA 40%', position: '9th', highlight: 'gold' },
    { id: 1, name: 'RENCHER #100', position: 'NX', highlight: 'red' },
    { id: 4, name: 'WD', position: 'NX 9th' },
    { id: 5, name: 'WD', position: 'NX 9th' },
    { id: 4, name: 'WD', position: 'NX 9th' },
    { id: 6, name: 'WD', position: 'NX 9th' },
    { id: 7, name: 'WD', position: 'NX 9th' },
    { id: 8, name: 'WD', position: 'NX 9th' },
    { id: 9, name: 'WD', position: 'NX 9th' },
    { id: 10, name: 'WD', position: 'NX 9th' },
    { id: 11, name: 'WD', position: 'NX 9th' },
    { id: 12, name: 'WD', position: 'NX 9th' },
    { id: 13, name: 'WD', position: 'NX 9th' },
    { id: 14, name: 'WD', position: 'NX 9th' },
    // Add more entries as needed...
  ];
  
  return (
    <div className="flex h-screen overflow-hidden text-black">
      <div className="flex flex-col flex-1">
      {/* Pass the mapped symbol to the TradingViewWidget */}
      <CarLeaderboard entries={dummyData} />
      <div className="h-[50vh]">
        <ChartExample  />
      </div>
        <div className="overflow-y-auto h-[50vh]">
          <TabbedTables />
        </div>
      </div>
      <div className="overflow-y-auto bg-[#17171c] rounded-lg !w-[350px]">
        {loading ? (
          <Spin size="large" className="flex justify-center w-full !mt-24" />
        ) : (
          <MarketInfo token={token} />
        )}
      </div>
    </div>
  );
};

export default TradingChart;