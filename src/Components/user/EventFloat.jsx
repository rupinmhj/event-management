import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MdCalendarToday, MdDescription } from "react-icons/md";
import useAxiosAuth from "@/hooks/useAxiosAuth";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
export const EventFloat = () => {
  const api = useAxiosAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await api.get("/api/event/active-events/");
      console.log("float", res.data);
      setEvents(res.data); // <-- store full array
    };
    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "PHYSICAL":
        return "bg-blue-100 text-blue-800";
      case "ONLINE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex justify-center mt-1">
       <div className="max-w-6xl  mt-2">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false, // Add this
          stopOnLastSlide: false    // Add this
        }}
        // pagination={{ clickable: false }}
        loop={events.length > 1}
        spaceBetween={20}
        className="w-full h-auto"
      >
        {events.map((event, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full bg-gradient-to-r from-blue/70 to-blue/90 p-4 text-white">
              <CardContent className="p-2">
                <div className="flex items-start justify-between mb-3 ">
                  <div>
                    <img src={event.icon} className="h-10" alt="" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-300 truncate text-[30px]">
                      {event.title}
                    </h3>
                  </div>
                  <Badge
                    className={`text-xs font-medium px-2 py-1 ${getEventTypeColor(
                      event.event_type
                    )}`}
                  >
                    {event.event_type}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <MdCalendarToday className="h-4 w-4 mb-[2px]" />
                    <span>Start: {formatDate(event.start_date)}</span>
                  </div>
                  {event.end_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-200 ">
                      <MdCalendarToday className="h-4 w-4 " />
                      <span>End: {formatDate(event.end_date)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </div>
   
  );
};


