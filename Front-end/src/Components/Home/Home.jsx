import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaEdit,
  FaDownload,
  FaPlus,
  FaList,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

import cloudLogo from "../../assets/icon.png";
import sunImg from "../../assets/2.png";
import cloudImg from "../../assets/4.png";
import rainImg from "../../assets/1.png";

export default function Home() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState(null);

  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const [weather, setWeather] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);


  const fetchEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/events/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.data?.events) setEvents(data.data.events);
      else setEvents([]);
      setShowEvents(true);
      setShowFavorites(false);
    } catch (err) {
      console.error("fetchEvents error:", err);
      setError("Could not load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleShowEvents = () => (!showEvents ? fetchEvents() : setShowEvents(false));

  const handleAddToFavorites = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/events/favorite/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setFavorites((prev) => [...prev, data.data.favorite]);
      } else {
        console.warn("Failed to add favorite:", data);
      }
    } catch (err) {
      console.error("handleAddToFavorites error:", err);
    }
  };

  const handleShowFavorites = async () => {
    if (!showFavorites) {
      setLoadingFavorites(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/events/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "success") setFavorites(data.data.favorites || []);
        else setFavorites([]);
        setShowFavorites(true);
        setShowEvents(false);
      } catch (err) {
        console.error("handleShowFavorites error:", err);
        setFavorites([]);
        setShowFavorites(true);
      } finally {
        setLoadingFavorites(false);
      }
    } else {
      setShowFavorites(false);
    }
  };

  const handleEditEvent = (id) => navigate(`/events/edit/${id}`);
  const handleEventClick = (id) => navigate(`/events/${id}/weather`);
  const handleAddEvent = () => navigate("/create");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/events/download-csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "events.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("download CSV error:", err);
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/user/predict-three-days`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "success" && data.data?.forecastNext3Days_mm) {
          const forecast = data.data.forecastNext3Days_mm.map((val, i) => ({
            day: `Day ${i + 1}`,
            rain: Number(val).toFixed(2),
          }));
          setWeather(forecast);
        } else {
          setWeather([]);
        }
      } catch (err) {
        console.error("fetchWeather err:", err);
        setWeather([]);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [API_URL]);

  const getWeatherIcon = (rain) =>
    rain < 1 ? sunImg : rain < 5 ? cloudImg : rainImg;

  const todayRain = useMemo(() => (weather[0] ? weather[0].rain : "0.00"), [weather]);

  return (
    <div className="relative min-h-screen font-sans p-6 bg-gradient-to-br from-[#5076B4] to-[#C48EF1] text-gray-900 dark:from-[#002E78] dark:to-[#160524] dark:text-white">

      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl shadow-lg">
        <button
          onClick={() => navigate("/profile")}
          title="Show Profile"
          className="w-12 h-12 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition transform hover:-translate-y-1"
        >
          <FaUser className="text-blue-300" size={18} />
        </button>

        <button
          onClick={handleAddEvent}
          title="Add Event"
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition transform hover:-translate-y-1"
        >
          <FaPlus className="text-white" size={18} />
        </button>

        <button
          onClick={handleShowEvents}
          title="Show Events"
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition transform hover:-translate-y-1"
        >
          <FaList className="text-white" size={18} />
        </button>

        <button
          onClick={handleShowFavorites}
          title="Show Favorites"
          className="w-12 h-12 rounded-full bg-amber-400/10 hover:bg-amber-400/20 flex items-center justify-center transition transform hover:-translate-y-1"
        >
          <FaStar className="text-yellow-300" size={18} />
        </button>

        <button
          onClick={handleDownloadCSV}
          title="Download CSV"
          className="w-12 h-12 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition transform hover:-translate-y-1"
        >
          <FaDownload className="text-green-300" size={18} />
        </button>

        <button
          onClick={handleLogout}
          title="Logout"
          className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition transform hover:-translate-y-1"
        >
          <FaSignOutAlt className="text-red-300" size={18} />
        </button>
      </div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex sm:hidden gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl shadow-lg">
        <button onClick={() => navigate("/profile")} title="Profile" className="w-10 h-10 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition">
          <FaUser className="text-blue-300" size={18} />
        </button>
        <button onClick={handleAddEvent} title="Add Event" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
          <FaPlus className="text-white" size={18} />
        </button>
        <button onClick={handleShowEvents} title="Show Events" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
          <FaList className="text-white" size={18} />
        </button>
        <button onClick={handleShowFavorites} title="Favorites" className="w-10 h-10 rounded-full bg-amber-400/10 hover:bg-amber-400/20 flex items-center justify-center transition">
          <FaStar className="text-yellow-300" size={18} />
        </button>
        <button onClick={handleLogout} title="Logout" className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition">
          <FaSignOutAlt className="text-red-300" size={18} />
        </button>
      </div>

      <div className="mb-8 text-center">
        <img src={cloudLogo} alt="logo" className="h-16 mx-auto mb-3 drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold mb-2 tracking-wide">
          Welcome to <span className="text-yellow-300">Know Before You Go</span>
        </h1>
        <p className="text-base text-gray-800 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your smart assistant to check the weather, plan your events, and stay prepared 🌦️
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <div className="bg-white/90 dark:bg-white/5 rounded-2xl p-6 shadow-xl h-[500px] flex flex-col justify-center items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFE29F] to-[#FFD37E] flex items-center justify-center shadow-md mb-3">
            <img src={sunImg} alt="sun" className="h-10" />
          </div>
          <h3 className="text-base font-semibold mb-1">Weather Today</h3>
          <p className="text-3xl font-extrabold text-[#5076B4]">25°C</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Sunny and clear skies</p>
        </div>

        <div className="lg:col-span-2 bg-white/90 dark:bg-white/5 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center h-[500px]">
          <h3 className="font-semibold mb-6 text-lg">Next 3 Days Temperature</h3>
          <svg width="100%" height="160" viewBox="0 0 300 100" preserveAspectRatio="none">
            <path
              d="M0,70 Q50,25 100,70 T200,70 T300,70"
              fill="none"
              stroke="#8A2BE2"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx="0" cy="70" r="5" fill="#FFD700" />
            <circle cx="100" cy="40" r="5" fill="#FFD700" />
            <circle cx="200" cy="65" r="5" fill="#FFD700" />
            <text x="0" y="45" textAnchor="middle" fontSize="16" fill="#FFD700">22°C</text>
            <text x="100" y="20" textAnchor="middle" fontSize="16" fill="#FFD700">28°C</text>
            <text x="200" y="45" textAnchor="middle" fontSize="16" fill="#FFD700">24°C</text>
          </svg>
          <div className="mt-6 flex justify-between w-full px-6 text-sm text-gray-700 dark:text-gray-300">
            <span>Day 1</span>
            <span>Day 2</span>
            <span>Day 3</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10">
        {showEvents && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Events</h2>
            {loadingEvents ? (
              <p className="text-center">Loading events...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : events.length === 0 ? (
              <p className="text-center text-gray-500">No events found.</p>
            ) : (
              <ul className="space-y-4">
                {events.map((ev) => (
                  <li
                    key={ev.eventId}
                    className="bg-white/95 dark:bg-white/5 rounded-xl p-4 shadow flex justify-between items-center"
                  >
                    <div className="cursor-pointer flex-1 text-left" onClick={() => handleEventClick(ev.eventId)}>
                      <h3 className="font-semibold">{ev.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(ev.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => handleAddToFavorites(ev.eventId)}
                        className="p-2 rounded-md bg-yellow-50 hover:bg-yellow-100"
                        title="Add to favorites"
                      >
                        <FaStar className="text-yellow-500" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(ev.eventId)}
                        className="p-2 rounded-md bg-blue-50 hover:bg-blue-100"
                        title="Edit event"
                      >
                        <FaEdit className="text-blue-500" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {showFavorites && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
            {loadingFavorites ? (
              <p className="text-center">Loading favorites...</p>
            ) : favorites.length === 0 ? (
              <p className="text-center text-gray-500">No favorites found.</p>
            ) : (
              <ul className="space-y-4">
                {favorites.map((f) => (
                  <li
                    key={f._id}
                    className="bg-white/95 dark:bg-white/5 rounded-xl p-4 shadow flex justify-between items-center"
                  >
                    <div className="cursor-pointer flex-1 text-left" onClick={() => handleEventClick(f.event._id)}>
                      <h3 className="font-semibold">{f.event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(f.event.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => handleAddToFavorites(f.event._id)}
                        className="p-2 rounded-md bg-yellow-50 hover:bg-yellow-100"
                        title="Add to favorites"
                      >
                        <FaStar className="text-yellow-500" />
                      </button>
                      <button
                        onClick={() => handleEditEvent(f.event._id)}
                        className="p-2 rounded-md bg-blue-50 hover:bg-blue-100"
                        title="Edit event"
                      >
                        <FaEdit className="text-blue-500" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
