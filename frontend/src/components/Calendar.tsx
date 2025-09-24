import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  occupiedDates?: string[]; // Dates that have appointments (fully booked)
  showLegend?: boolean; // Control whether to show legend and info
}

const Calendar = ({ selectedDate, onDateSelect, occupiedDates = [], showLegend = true }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);
  // Convert Sunday (0) to 7, then subtract 1 to make Monday = 0
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDate = (day: number) => {
    const date = new Date(currentYear, currentMonthIndex, day);
    return date.toISOString().split("T")[0];
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonthIndex, day);

    // Disable past dates
    if (date < today) return true;

    // Disable Sundays (0 = Sunday)
    if (date.getDay() === 0) return true;

    return false;
  };

  const getDayStatus = (day: number) => {
    const dateString = formatDate(day);

    if (occupiedDates.includes(dateString)) {
      return "occupied";
    }

    return "available";
  };

  const getDayClasses = (day: number) => {
    const dateString = formatDate(day);
    const isSelected = selectedDate === dateString;
    const isDisabled = isDateDisabled(day);
    const status = getDayStatus(day);

    let classes = "relative w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-colors ";

    if (isDisabled) {
      classes += "text-gray-300 cursor-not-allowed bg-gray-50";
    } else if (isSelected) {
      classes += "bg-gray-600 text-white";
    } else {
      switch (status) {
        case "occupied":
          classes += "bg-red-100 text-red-800 hover:bg-red-200 cursor-not-allowed";
          break;
        default:
          classes += "text-gray-900 hover:bg-gray-100";
      }
    }

    return classes;
  };

  const handleDayClick = (day: number) => {
    if (isDateDisabled(day)) return;

    const dateString = formatDate(day);
    if (occupiedDates.includes(dateString)) return; // Block clicking on occupied dates

    onDateSelect(dateString);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

  const dayNames = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => navigateMonth("prev")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonthIndex]} {currentYear}
        </h3>

        <button type="button" onClick={() => navigateMonth("next")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {dayNames.map((dayName) => (
          <div key={dayName} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <div key={index} className="h-10 flex items-center justify-center">
            {day && (
              <button type="button" onClick={() => handleDayClick(day)} className={getDayClasses(day)} disabled={isDateDisabled(day)}>
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend - tylko dla użytkowników, nie dla adminów */}
      {showLegend && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Dostępne</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Zajęte</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Niedostępne</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Informacja:</strong> Jeśli chcesz umówić wizytę w zajęte dni,{" "}
            <a href="/contact" className="text-[var(--color-blue-dark)] hover:text-[var(--color-blue-dark-hover)] underline">
              skontaktuj się z nami
            </a>
            .
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
