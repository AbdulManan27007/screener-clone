import React, { useState } from "react";
import { Button, Form, Input, Modal, notification, Select } from "antd";
import {
  FaTwitter,
  FaTelegram,
  FaCopy,
  FaSearch,
  FaCheck,
  FaInfo,
  FaFire,
  FaFlag,
  FaPoop,
  FaArrowCircleUp,
  FaArrowCircleDown,
  FaTelegramPlane,
  FaBullhorn,
} from "react-icons/fa";
import { Typography } from "antd";
import { TbWorld } from "react-icons/tb";
import { BsTwitterX } from "react-icons/bs";
import { SwapOutlined } from "@ant-design/icons";
import { RiArrowUpDownLine } from "react-icons/ri";
import { AiOutlineBell } from "react-icons/ai";
import tokenImage from "../assets/wof.webp";
import tokenprofile from "../assets/token.webp";
import { HiOutlineSpeakerphone } from "react-icons/hi"; // or use another megaphone icon
import { CiStar } from "react-icons/ci";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import { marketData } from "../utils/dummyData";
import { ImEmbed2 } from "react-icons/im";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { RiArrowDropDownLine, RiRocketFill } from "react-icons/ri";
import {
  PiArrowSquareOutDuotone,
  PiXLogoBold,
  PiInfoBold,
} from "react-icons/pi";
import { GrDown } from "react-icons/gr";
import { PowerIcon, ProgressIcon, EyesIcon } from "../assets/icons/Icons";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CgArrowsExchange } from "react-icons/cg";

import { Dropdown, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

const items = [
  {
    key: "1",
    label: (
      <>
        <span className="flex flex-row items-center gap-2 text-white">
          <CgArrowsExchange />
          Invert Pair
        </span>{" "}
        <span className="text-gray-500">MCPOS/SOL SOL/MCPOS</span>
      </>
    ),
  },
  {
    key: "2",
    label: (
      <span className="flex flex-row items-center gap-2 text-white">
        <IoMdArrowRoundBack />
        Move sidebar to the left
      </span>
    ),
  },
  {
    key: "3",
    label: (
      <span className="flex flex-row items-center gap-2 text-white">
        <IoEyeOff />
        Hide sidebar
      </span>
    ),
  },
  {
    key: "4",
    label: (
      <span className="flex flex-row items-center gap-2 text-white">
        <IoEyeOff />
        Hide trending bar
      </span>
    ),
  },
  {
    key: "5",
    label: (
      <span className="flex flex-row items-center gap-2 text-white">
        <IoEyeOff />
        Hide header image
      </span>
    ),
  },
];

const menu = (
  <Menu items={items} className="!bg-[#222227] border-none rounded-md " />
);

const API_URL = "http://localhost:8000/api";
const { Text } = Typography;

// Candle generation function

const MarketSidebar = ({ token }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);
  const [toggleClicked, setToggleClicked] = useState(false);
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("0.0005517");
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("5M");
  const [type, setType] = useState("");
  const [form] = Form.useForm();

  const { pairAddress } = useParams();

  // Correct dummy data initialization
  const [randomData] = useState(() => {
    const randomIndex = Math.floor(Math.random() * marketData.length);
    return marketData[randomIndex];
  });

  function generateCandle(basePrice) {
    let fluctuation = basePrice * 0.05; // 5% fluctuation range
    const isBearish = Math.random() < 0.6; // 60% chance of a bearish candle

    let open = (
      basePrice +
      (Math.random() * fluctuation - fluctuation / 2)
    ).toFixed(2);
    let high, low, close;

    if (isBearish) {
      // Bearish scenario: close lower than open
      high = (parseFloat(open) + Math.random() * (fluctuation * 2)).toFixed(2); // Increased range
      low = (parseFloat(high) - Math.random() * (fluctuation * 2)).toFixed(2); // Increased range
      close = (
        parseFloat(low) +
        Math.random() * (parseFloat(open) - parseFloat(low))
      ).toFixed(2);
    } else {
      // Bullish scenario: close higher than open
      low = (parseFloat(open) - Math.random() * (fluctuation * 7)).toFixed(2); // Increased range
      high = (parseFloat(open) + Math.random() * (fluctuation * 7.5)).toFixed(
        2
      ); // Increased range
      close = (
        parseFloat(low) +
        Math.random() * (parseFloat(high) - parseFloat(low))
      ).toFixed(2);
    }

    console.log("========", open, high, low, close, isBearish);
    return { open, high, low, close, isBearish };
  }

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleClick = () => {
    setToggleClicked(!toggleClicked);
  };

  const formatTimeAgo = (isoDate) => {
    if (!isoDate) return "N/A";

    const createdAt = new Date(isoDate).getTime();
    const now = new Date().getTime();

    const diffInMs = now - createdAt;
    const diffInSeconds = Math.floor(diffInMs / 1000);

    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m ago`;
  };

  const handleSave = async (type, price) => {
    try {
      // Generate candle data using the entered price
      const candleData = generateCandle(price);

      // Prepare values to save
      const values = {
        tokenId: pairAddress,
        volume: randomData.volume,
        // priceUSD: randomData.priceUSD,
        // priceSOL: randomData.priceSOL,
        // pnl: randomData.pnl,
        // unrealized: randomData.unrealized,
        type: type,
        // Add candle data to the transaction
        priceSOL: candleData.open,
        priceUSD: candleData.high,
        pnl: candleData.low,
        unrealized: candleData.close,
        // candleIsBearish: candleData.isBearish
      };

      await create(values); // Save to backend
      setModalVisible(false);
    } catch (error) {
      notification.error({
        message: "Error saving candle data",
      });
      console.error("Error:", error);
    }
  };

  const create = async (values) => {
    try {
      await axios.post(`${API_URL}/transactions`, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      notification.success({ message: `${values.type} created successfully.` });
    } catch (error) {
      notification.error({ message: `Error creating ${values.type}.` });
      console.error("Error creating:", error);
    }
  };

  const handleCreate = (type) => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (role === "user" && token) {
      setType(type);
      form.resetFields();
      setModalVisible(true);
    } else {
      navigate("/login");
    }
  };
  const timePeriodData = {
    "5M": {
      priceChange: "-9.91%",
      txns: 1805,
      buys: 995,
      sells: 810,
      volume: "$483K",
      buyVol: "$225K",
      sellVol: "$258K",
      makers: 775,
      buyers: 476,
      sellers: 483,
    },
    "1H": {
      priceChange: "-23.46%",
    },
    "6H": {
      priceChange: "0.84%",
    },
    "24H": {
      priceChange: "5,580%",
    },
  };
  return (
    <div className="w-full text-white rounded-lg bg-[#17171C]">
      <div className="relative">
        <div className="items-center space-x-2">
          <div className="flex justify-between items-center p-2 fixed bg-[#222227] w-[330px] z-50 rounded shadow ">
            <div className="flex items-center space-x-2">
              <img
                src={token?.logo || tokenImage}
                alt={token?.logo}
                className="w-8 h-8 rounded"
              />
              <h2 className="text-lg font-bold text-white">
                {token?.mintA?.name}
              </h2>
            </div>
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName="!bg-[#222227] !border-none !rounded-md"
            >
              <EllipsisOutlined className="p-1 text-xl text-white rotate-90 border cursor-pointer border-[#343439] rounded-md" />
            </Dropdown>
          </div>
          <div className="flex flex-col items-center justify-center pt-14">
            <span className="flex items-center gap-2 !font-bold !text-lg">
              <Text
                copyable={{
                  text: token?.mintA?.name || "",
                  tooltips: ["Copy", "Copied!"],
                  icon: (
                    <FaRegCopy className="text-white cursor-pointer hover:text-[#a4cf5e]" />
                  ),
                }}
                className="!text-white !font-bold !text-lg "
              >
                {token?.mintA?.name}
              </Text>
              / {token?.mintB?.name}
              <span className="text-sm text-[#a4cf5e]">▼12h</span>
              <span className="text-sm text-orange-400">
                🔥 #{token?.rank || 29}
              </span>
              <span className="text-sm text-yellow-400">
                ⚡ {token?.power || 100}
              </span>
            </span>
          </div>
        </div>
        <div className="absolute z-50 w-full mx-auto bg-[#17171C] ">
          <div className="flex items-center justify-center gap-2 mx-auto my-2 text-xs text-gray-400 ">
            <div className="flex items-center ">
              {/* <img src="/images/liquidity-icon.png" alt="" /> */}
              <img
                src="/images/solana.png"
                alt="PumpSwap"
                className="w-6 h-4 mr-1 "
              />
              <span className="text-[13px]">Solana</span>
            </div>
            <span className="mx-1 text-[15px] text-white">{">"}</span>
            <div className="flex items-center">
              <img
                src="/images/raydium.png"
                alt="raydium"
                className="w-5 h-4 mr-1 "
              />
              <span className="text-[13px]">Raydium</span>
            </div>
            <span className="text-gray-500">via</span>
            <div className="flex items-center">
              <img
                src="/images/pump.png"
                alt="Pump.fun"
                className="w-5 h-4 mr-1 "
              />
              <span className="text-[13px]">Pump.fun</span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <img
          src={token?.logo || tokenImage}
          alt={token?.logo}
          className="w-full pt-1 transition-transform duration-200 ease-in-out rounded hover:scale-105 h-[130px]"
        />
        <div className="flex absolute w-full -bottom-3.5  px-4 !rounded-none ">
          <Button
            icon={<TbWorld />}
            aria-label="Share on Twitter"
            className="!bg-[#343438] !text-white w-1/2  !border-none !rounded-r-none hover:!bg-[#4b4b50] "
          >
            Website
          </Button>
          <Button
            icon={<BsTwitterX />}
            aria-label="Share on Telegram"
            className="!bg-[#2e2e33] !text-white w-1/2 !border-none !rounded-none hover:!bg-[#4b4b50] "
          >
            Twitter
          </Button>
          <Button
            icon={<RiArrowDropDownLine size={32} />}
            className="!bg-[#2e2e33] !text-white w-1/2 !border-none !rounded-l-none hover:!bg-[#4b4b50] "
          ></Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mt-2 text-center ">
          <div className="px-2 py-1 border border-[#343439] rounded-lg">
            <p className="text-xs text-gray-500">PRICE USD</p>
            <p className="text-sm font-bold">${token?.priceUSD}</p>
          </div>
          <div className="px-2 py-1 border border-[#343439] rounded-lg">
            <p className="text-xs text-gray-500">PRICE</p>
            <p className="text-sm font-bold">{token?.priceSOL} SOL</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="px-2 py-1 space-y-[2px] border border-[#343439] rounded-lg">
            <p className="text-xs text-gray-400">LIQUIDITY</p>
            <p className="flex flex-row items-center justify-center gap-1 text-sm font-bold">
              ${token?.liquidity}K{" "}
              <span className="">
                <img src="/images/liqudity-icon.png" alt="" />
              </span>
            </p>
          </div>
          <div className="px-2 py-1 space-y-[2px] border border-[#343439] rounded-lg">
            <p className="text-xs text-gray-500">FDV</p>
            <p className="text-sm font-bold">${token?.fdv}</p>
          </div>
          <div className="px-2 py-1 space-y-[2px] border border-[#343439] rounded-lg">
            <p className="text-xs text-gray-500">MKT CAP</p>
            <p className="text-sm font-bold">${token?.mktCap}</p>
          </div>
        </div>

        <div className=" my-1 border border-[#343439] rounded-md">
          <div className="flex justify-between mb-4 border border-[#343439]">
            {["5M", "1H", "6H", "24H"].map((tab) => (
              <button
                key={tab}
                className={`p-2 w-full border-r border-[#343439] text-sm font-medium ${
                  activeTab === tab
                    ? "text-white font-bold bg-[#343439]"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <div
                  className={`text-xs mt-1 ${
                    tab === "5M"
                      ? "text-red-500"
                      : tab === "1H"
                      ? "text-red-500"
                      : tab === "6H"
                      ? "text-[#a4cf5e]"
                      : "text-[#a4cf5e]"
                  }`}
                >
                  {timePeriodData[tab].priceChange}
                </div>
              </button>
            ))}
          </div>
          <div className="flex flex-row px-1">
            <div className="grid w-1/3 grid-row-3">
              <div className="px-2 py-1">
                <p className="text-xs text-gray-400">TXNS</p>
                <p className="text-sm font-bold">{token?.txns}</p>
              </div>
              <div className="px-2 py-1 ">
                <p className="text-xs text-gray-400">VOLUME</p>
                <p className="text-sm font-bold">{token?.volume}</p>
              </div>
              <div className="px-2 py-1 ">
                <p className="text-xs text-gray-400">MAKERS</p>
                <p className="text-sm font-bold">{token?.ownerToken}</p>
              </div>
            </div>

            <div className="border mb-2 border-[#343439]"></div>
            <div className="flex w-full mb-2">
              <div className="flex flex-col w-full gap-3 text-left ">
                <div className="py-1 pl-2 rounded-lg ">
                  <p className="text-xs text-gray-400">BUYS</p>
                  <p className="text-sm font-bold">{token?.buys}</p>
                  <p className="border-b-3 border-[#a4cf5e]"></p>
                </div>
                <div className="py-1 pl-2 rounded-lg ">
                  <p className="text-xs text-gray-400">BUYS VOL</p>
                  <p className="text-sm font-bold">${token?.buyVol}</p>
                  <p className="border-b-3 border-[#a4cf5e]"></p>
                </div>
                <div className="py-1 pl-2 rounded-lg ">
                  <p className="text-xs text-gray-400">BUYERS</p>
                  <p className="text-sm font-bold">{token?.buyers}</p>
                  <p className="border-b-3 border-[#a4cf5e]"></p>
                </div>
              </div>
              <div className="flex flex-col w-full gap-3 text-end">
                <div className="py-1 pl-1 pr-2 rounded-lg ">
                  <p className="text-xs text-gray-400">SELLS</p>
                  <p className="text-sm font-bold">{token?.sells}</p>
                  <p className="border-b-3 border-[#FA5B5B]"></p>
                </div>
                <div className="py-1 pl-1 pr-2 rounded-lg ">
                  <p className="text-xs text-gray-400">SELLS VOL</p>
                  <p className="text-sm font-bold">${token?.sellVol}</p>
                  <p className="border-b-3 border-[#FA5B5B]"></p>
                </div>
                <div className="py-1 pl-1 pr-2 rounded-lg ">
                  <p className="text-xs text-gray-400">SELLERS</p>
                  <p className="text-sm font-bold">{token?.sellers}</p>
                  <p className="border-b-3 border-[#FA5B5B]"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <Button className="!bg-[#2e2e33] !font-popins !text-white !rounded-md !border-none w-1/2 !py-4 !cursor-pointer hover:!bg-[#4b4b50]">
            <CiStar size="22px" />
            Watchlist
          </Button>
          <Button className="!bg-[#2e2e33] !text-white !border-none w-1/2 !py-4  !rounded-md  !cursor-pointer hover:!bg-[#4b4b50]">
            <AiOutlineBell size="18px" />
            Alerts
          </Button>
        </div>
        <div className="flex justify-between ">
          <Button
            className="!bg-[#2e2e33] !text-white !border-none w-1/2 !py-4 !cursor-pointer 
               hover:!bg-[#33381a] !rounded-l-md !rounded-r-none !font-bold"
            onClick={() => handleCreate("buy")}
          >
            <FaArrowCircleUp style={{ color: "#a4cf5e" }} size="18px" />
            Buy
          </Button>
          <span className="border border-gray-700 w-[0.5px]"></span>
          <Button
            className="!bg-[#2e2e33] !text-white !border-none w-1/2 !py-4 !cursor-pointer 
               hover:!bg-[#3a2226] !rounded-r-md !rounded-l-none !font-bold"
            onClick={() => handleCreate("sell")}
          >
            <FaArrowCircleDown style={{ color: "#FA5B5B" }} size="18px" />
            Sell
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-[#969698] px-4 py-3 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <HiOutlineSpeakerphone className="text-base" />
          <span className="font-semibold cursor-pointer hover:underline">
            Advertise your token
          </span>
        </div>
        <button className="cursor-pointer hover:underline">Hide ad</button>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-[6px]">
        <div className="flex justify-between border-b border-[#29292E] ">
          <span className="mb-2 text-sm">Pair created</span>
          <span className="text-sm font-bold">
            {formatTimeAgo(token?.createdAt)}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#29292E]  ">
          <span className="mb-2 text-sm">Pooled {token?.mintA?.name}</span>
          <div className="flex gap-2">
            <span className="text-sm font-bold"> {token?.mintA?.pool}</span>
            <span className="text-sm font-bold">${token?.mintA?.price}K </span>
          </div>
        </div>
        <div className="flex justify-between border-b border-[#29292E] ">
          <span className="mb-2 text-sm">Pooled {token?.mintB?.name}</span>
          <div className="flex gap-2">
            <span className="text-sm font-bold">{token?.mintB?.pool}</span>
            <span className="text-sm font-bold">${token?.mintB?.price}K </span>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-[#29292E] py-2">
          <span className="text-sm ">Pair</span>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-2 py-1 bg-[#2e2e33] text-white text-xs rounded-md cursor-pointer hover:!bg-[#4b4b50]"
              onClick={() => handleCopy(token?.pairAddress)}
            >
              <FaCopy
                size={14}
                className={`transition-colors duration-200 ${
                  copied === token?.pairAddress
                    ? "text-[#a4cf5e]"
                    : "text-[#bfbfc4]"
                }`}
              />
              <span className="tracking-wide">
                {token?.pairAddress?.length > 10
                  ? `${token?.pairAddress?.slice(
                      0,
                      5
                    )}...${token?.pairAddress?.slice(-4)}`
                  : token?.pairAddress}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#bfbfc4] cursor-pointer">
              <span>EXP</span>
              <PiArrowSquareOutDuotone size={14} />
            </div>
          </div>
        </div>

        {[token?.mintA, token?.mintB].map((mint, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-[#29292E]"
          >
            <span className="text-sm">{mint?.name}</span>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 px-2 py-1 bg-[#2e2e33] text-white text-xs rounded-md cursor-pointer hover:!bg-[#4b4b50]"
                onClick={() => handleCopy(mint?.address)}
              >
                <FaCopy
                  size={14}
                  className={`transition-colors duration-200 ${
                    copied === mint?.address
                      ? "text-[#a4cf5e]"
                      : "text-[#bfbfc4]"
                  }`}
                />
                <span>
                  {mint?.address?.length > 10
                    ? `${mint?.address?.slice(0, 5)}...${mint?.address?.slice(
                        -4
                      )}`
                    : mint?.address}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#bfbfc4] cursor-pointer">
                <span>EXP</span>
                <PiArrowSquareOutDuotone size={14} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex w-full gap-2 ">
          <button className="flex items-center justify-center w-1/2 gap-2 px-2 py-2 text-[12px] font-medium text-white border border-[#343439] rounded-md bg-[#17171c] hover:bg-[#1f1f24] transition cursor-pointer">
            <BsTwitterX size={13} />
            Search on Twitter
          </button>
          <button className="flex items-center justify-center w-1/2 gap-2 px-2 py-2 text-[12px] font-medium text-white border border-[#343439] rounded-md bg-[#17171c] hover:bg-[#1f1f24] transition cursor-pointer">
            <FaSearch size={13} />
            Other pairs
          </button>
        </div>

        <div className="w-full border border-[#343439] rounded-md px-2">
          <div
            className="flex items-center justify-between w-full py-2 cursor-pointer"
            onClick={toggleClick}
          >
            <span className="font-sm">Audit</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">No issues</span>
              <FaCheck className="bg-[#48BB78] rounded-full text-white p-0.5" />
              <IoIosArrowDown
                size={16}
                className={`${
                  toggleClicked ? "rotate-180" : ""
                } transition-transform duration-300`}
              />
            </div>
          </div>

          {toggleClicked && (
            <div className="border-t border-[#343439] pt-2">
              <div className="flex items-center justify-between py-2 border-b border-[#343439]">
                <div className="flex items-center gap-2">
                  <FaInfo
                    size={15}
                    className="bg-white text-gray-700 rounded-full p-0.5"
                  />
                  <span className="text-sm">Mintable</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="bg-[#48BB78] rounded-full text-white p-0.5" />
                  <span className="!text-[13px]">No</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <FaInfo
                    size={15}
                    className="bg-white text-gray-700 rounded-full p-0.5"
                  />
                  <span className="!text-[13px]">Freezable</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="bg-[#48BB78] rounded-full text-white p-0.5" />
                  <span className="text-sm">No</span>
                </div>
              </div>

              <div className="flex justify-center my-2 hover:!bg-[#29292E] rounded-md cursor-pointer py-1">
                <IoIosArrowDown
                  size={18}
                  onClick={toggleClick}
                  className="rotate-180 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
        <div className="text-[12px] mb-2 text-gray-500">
          Warning! Audits may not be 100% accurate! More.
        </div>
        <Button className="group flex items-center !font-bold !border-yellow-500 !bg-[#352c17] !text-[#f0b90b] hover:!bg-yellow-400">
          <span className="text-sm transition-colors duration-200 group-hover:text-[#393019]">
            <PowerIcon />
          </span>
          <span className="text-sm text-[#f0b90b] transition-colors duration-200 group-hover:text-[#393019]">
            Boost
          </span>
        </Button>

        <div className="flex items-center justify-between gap-2">
          <span className="flex flex-col items-center justify-center w-full p-2 border border-[#343439]  rounded-md cursor-pointer hover:bg-[#29292E]">
            <img src="/images/rocket.svg" alt="" />
            3909
          </span>
          <span className="flex flex-col items-center justify-center w-full p-2 border border-[#343439]  rounded-md cursor-pointer hover:bg-[#29292E]">
          <img src="/images/fire.svg" alt="" />
          166
          </span>
          <span className="flex flex-col items-center justify-center w-full p-2 border border-[#343439]  rounded-md cursor-pointer hover:bg-[#29292E]">
          <img src="/images/tati.svg" alt="" />
          50
          </span>
          <span className="flex flex-col items-center justify-center w-full p-2 border border-[#343439]  rounded-md cursor-pointer hover:bg-[#29292E]">
          <img src="/images/flag.svg" alt="" />
          111
          </span>
        </div>
        <div className=" bg-gradient-to-b  from-transparent from-70% to-[#3C3C40] rounded-b-2xl">
          <div className="relative bg-gradient-to-b from-[#1D2B23] to-[#020303] text-center p-6 rounded-2xl shadow-md max-w-md mx-auto text-white mt-10">
            <img
              src={token?.logo || tokenprofile}
              alt={token?.logo}
              className="absolute w-20 h-20 mx-[28%]  border-[#343439] rounded-xl border-2 -mt-14"
            />
            <h2 className="mt-10 text-xl font-bold">{token?.mintA?.name}</h2>
            <div className="grid items-center justify-center grid-cols-2 gap-3 my-3">
              <button className="flex flex-row items-center text-sm justify-center gap-2 p-2 rounded-md cursor-pointer bg-[#2C2F2D] hover:bg-[#3b443f]">
                <TbWorld className="" size={16}/> Website
              </button>
              <button className="flex flex-row items-center text-sm justify-center gap-2 p-2 bg-[#2C2F2D] rounded-md cursor-pointer hover:bg-[#3b443f]">
                <TbWorld className="" size={16}/> Warpcast
              </button>
              <button className="flex flex-row items-center text-sm justify-center gap-2 p-2 bg-[#2C2F2D] rounded-md cursor-pointer hover:bg-[#3b443f]">
                <PiXLogoBold className="" size={16}/> Twitter
              </button>
              <button className="flex flex-row items-center  text-sm justify-center gap-2 p-2 bg-[#2C2F2D] rounded-md cursor-pointer hover:bg-[#3b443f]">
                <FaTelegramPlane className="" size={16}/> Telegram
              </button>
            </div>
            {/* <button className="flex items-center gap-2 px-4 py-1 mx-auto font-semibold text-black rounded-md bg-[#A4CF5E]">
              <FaBullhorn />
              <span>Marketing Boost</span>
              <PiInfoBold />
            </button> */}
            <p className="mt-3 text-sm text-white">Dog Wof Autism !</p>
          </div>
          <div className="flex items-center justify-center gap-2 py-2 text-[12px] text-white cursor-pointer ">
            <EyesIcon />
            <span>Claim Your DEX Screener  <span className="font-bold"> Token Profile</span> </span>
          </div>
        </div>

        {/* last */}
        <div className="mx-auto mt-4 text-white rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2  border border-gray-700 rounded-md bg-[#333333]">
              <Input
                className="!text-white !bg-[#17171C] !py-2 !border-none !rounded-r-none"
                value={fromValue}
                onChange={(e) => {
                  setFromValue(e.target.value);
                  const inputValue = parseFloat(e.target.value) || 0;
                  setToValue((inputValue * 0.0005517).toString());
                }}
              />
              <span className="p-2 text-gray-400 ">{token?.mintB?.name}</span>
            </div>

            <div className="flex justify-center my-2">
              <RiArrowUpDownLine className="text-xl " />
            </div>

            <div className="flex items-center !p- border border-gray-700 rounded-md bg-[#333333]">
              <Input
                className="!text-white !bg-[#17171C] !border-none !py-2"
                value={toValue}
                onChange={(e) => setToValue(e.target.value)}
                readOnly // Make this input read-only if you only want one-way calculation
              />
              <div className="flex !py-1">
                <Button type="text" className="px-2  !text-white">
                  USD
                </Button>
                <Button type="text" className="!text-white">
                  SOL
                </Button>
              </div>
            </div>
          </div>

          <Button className="w-full font-bold py-2 mt-4 !text-white !bg-transparent rounded-md !border-[#343439] hover:!bg-[#4b4b50]">
            <ImEmbed2 className="text-[20px]"/>
            Embed this chart
          </Button>

          <p className="m-3 text-sm text-center text-gray-500 hover:underline">
            Crypto charts by TradingView
          </p>
        </div>
      </div>
      <Modal
        title={type === "buy" ? "Buy Token" : "Sell Token"}
        open={modalVisible}
        centered
        onOk={() => {
          const price = parseFloat(form.getFieldValue("price")); // Get price from form
          if (!price || price <= 0) {
            notification.error({ message: "Invalid price entered" });
            return;
          }
          handleSave(type, price);
        }}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tokenId: pairAddress,
          }}
        >
          <Form.Item name="_id" label="_id" className="hidden">
            <Input />
          </Form.Item>
          <Form.Item
            name="tokenId"
            label="Token ID"
            rules={[{ required: true, message: "Token ID is required" }]}
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Price is required" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MarketSidebar;
