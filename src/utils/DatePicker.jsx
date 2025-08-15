import React, { useState } from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

 const DatePicker = ({ value, onChange, minDate, maxDate,placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Initialize currentMonth to either the selected date or today
    if (value && !isNaN(new Date(value).getTime())) {
      return new Date(value);
    }
    return new Date();
  });
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  // Parse the value safely; if invalid or empty string, selectedDate is null
  const selectedDate =
    value && !isNaN(new Date(value).getTime()) ? new Date(value) : null;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
    const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    onChange(dateString);
    setCurrentMonth(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getYears = () => {
    const years = [];
    const minYear = minDate ? minDate.getFullYear() : 1900;
    const maxYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear();
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    return years;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative font-sans ">
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input rounded-md cursor-pointer bg-background hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <FaCalendar className="w-4 h-4 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 w-80 mt-1 bg-background border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                setIsYearPickerOpen(false);
                navigateMonth(-1);
              }}
              className="p-1 hover:bg-accent rounded"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            <h3
              className="text-sm font-medium cursor-pointer select-none"
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
              className="p-1 hover:bg-accent rounded"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isYearPickerOpen ? (
            <div
              className="max-h-48 overflow-y-auto grid grid-cols-4 gap-2"
              style={{ maxHeight: "12rem" }}
            >
              {getYears().map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`p-2 rounded text-center hover:bg-accent ${
                    currentMonth.getFullYear() === year
                      ? "bg-primary text-primary-foreground font-bold"
                      : ""
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
                    className="p-2 text-xs font-medium text-muted-foreground text-center"
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
                        className={`w-full h-full text-xs rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedDate && date.toDateString() === selectedDate.toDateString()
                            ? "bg-primary text-primary-foreground"
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
        </div>
      )}
    </div>
  );
};

export default DatePicker;