import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const DateTimePicker = ({ 
  value, 
  onChange, 
  minDate, 
  maxDate, 
  placeholder = "Select date and time",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value && !isNaN(new Date(value).getTime())) {
      return new Date(value);
    }
    return new Date();
  });
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("date");

  // Parse the value safely
  const selectedDateTime = value && !isNaN(new Date(value).getTime()) ? new Date(value) : null;

  const formatDateTime = (date) => {
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    
    const timeStr = date.toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${dateStr} ${timeStr}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++)
      days.push(new Date(year, month, day));
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateSelect = (date) => {
    let newDateTime = new Date(date);
    
    if (selectedDateTime) {
      // Preserve time when selecting new date
      newDateTime.setHours(selectedDateTime.getHours());
      newDateTime.setMinutes(selectedDateTime.getMinutes());
    } else {
      // Set default time to current time
      const now = new Date();
      newDateTime.setHours(now.getHours());
      newDateTime.setMinutes(now.getMinutes());
    }
    
    onChange(newDateTime.toISOString());
    setCurrentMonth(date);
    setActiveTab("time");
  };

  const handleTimeChange = (hours, minutes) => {
    const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date();
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);
    onChange(newDateTime.toISOString());
  };

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getYears = () => {
    const years = [];
    const minYear = minDate ? minDate.getFullYear() : 1900;
    const maxYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear() + 10;
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    return years;
  };

  const TimeSelector = () => {
    const currentHour = selectedDateTime ? selectedDateTime.getHours() : new Date().getHours();
    const currentMinute = selectedDateTime ? selectedDateTime.getMinutes() : new Date().getMinutes();
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {/* Hour Selector */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Hour</label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors ${
                    hour === currentHour ? "bg-blue/40 text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleTimeChange(hour, currentMinute)}
                >
                  {String(hour).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Minute Selector */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Minute</label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white">
              {minutes.filter(m => m % 5 === 0).map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors ${
                    minute === currentMinute ? "bg-blue/40 text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleTimeChange(currentHour, minute)}
                >
                  {String(minute).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 bg-blue rounded-md hover:bg-blue/80  transition-colors text-gray-100"
            onClick={() => setActiveTab("date")}
          >
            Back to Date
          </button>
          <button
            type="button"
            className="flex-1 px-3 py-2 text-sm bg-blue hover:bg-blue/60 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`relative font-sans ${className}`}>
      <div
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer bg-white transition-colors ${
          disabled 
            ? "bg-gray-100 cursor-not-allowed text-gray-400" 
            : "hover:bg-gray-50"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedDateTime ? "text-gray-900" : "text-gray-500"}>
          {selectedDateTime ? formatDateTime(selectedDateTime) : placeholder}
        </span>
        <Clock className={`w-4 h-4 ${disabled ? "text-gray-300" : "text-gray-400"}`} /> 
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "date" 
                  ? "border-b-2 border-blue/40 text-blue" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("date")}
            >
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Date
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "time" 
                  ? "border-b-2 border-blue/40 text-blue" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("time")}
              disabled={!selectedDateTime}
            >
              <Clock className="w-4 h-4 inline-block mr-1" />
              Time
            </button>
          </div>

          {/* Date Selection */}
          {activeTab === "date" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsYearPickerOpen(false);
                    navigateMonth(-1);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h3
                  className="text-sm font-medium cursor-pointer select-none hover:text-blue/60 transition-colors"
                  onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                >
                  {monthYear}
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setIsYearPickerOpen(false);
                    navigateMonth(1);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {isYearPickerOpen ? (
                <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-2">
                  {getYears().map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`p-2 rounded text-center text-sm transition-colors hover:bg-gray-100 ${
                        currentMonth.getFullYear() === year
                          ? "bg-blue/80 hover:text-blu text-white font-medium"
                          : "text-gray-900"
                      }`}
                      onClick={() => {
                        const newDate = new Date(currentMonth);
                        newDate.setFullYear(year);

                        if (minDate && newDate < minDate)
                          newDate.setFullYear(minDate.getFullYear());
                        if (maxDate && newDate > maxDate)
                          newDate.setFullYear(maxDate.getFullYear());

                        setCurrentMonth(newDate);
                        setIsYearPickerOpen(false);
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="p-2 text-xs font-medium text-gray-500 text-center"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => (
                      <div key={index} className="aspect-square">
                        {date && (
                          <button
                            type="button"
                            onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                            disabled={isDateDisabled(date)}
                            className={`w-full h-full text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              selectedDateTime && date.toDateString() === selectedDateTime.toDateString()
                                ? "bg-blue/80 text-white"
                                : "hover:bg-accent"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Time Selection */}
          {activeTab === "time" && <TimeSelector />}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;