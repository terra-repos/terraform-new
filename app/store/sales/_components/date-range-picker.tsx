"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { subDays, startOfMonth, endOfMonth, startOfYear } from "date-fns";

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

type PresetKey =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "last90"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export default function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("last30");
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const presets: Record<PresetKey, { label: string; getRange: () => DateRange }> = {
    today: {
      label: "Today",
      getRange: () => ({ start: new Date(), end: new Date() }),
    },
    yesterday: {
      label: "Yesterday",
      getRange: () => ({
        start: subDays(new Date(), 1),
        end: subDays(new Date(), 1),
      }),
    },
    last7: {
      label: "Last 7 Days",
      getRange: () => ({ start: subDays(new Date(), 7), end: new Date() }),
    },
    last30: {
      label: "Last 30 Days",
      getRange: () => ({ start: subDays(new Date(), 30), end: new Date() }),
    },
    last90: {
      label: "Last 90 Days",
      getRange: () => ({ start: subDays(new Date(), 90), end: new Date() }),
    },
    thisMonth: {
      label: "This Month",
      getRange: () => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }),
    },
    lastMonth: {
      label: "Last Month",
      getRange: () => {
        const lastMonth = subDays(startOfMonth(new Date()), 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      },
    },
    thisYear: {
      label: "This Year",
      getRange: () => ({ start: startOfYear(new Date()), end: new Date() }),
    },
    custom: {
      label: "Custom Range",
      getRange: () => dateRange,
    },
  };

  const handlePresetClick = (key: PresetKey) => {
    if (key === "custom") {
      setShowCustom(true);
      setSelectedPreset(key);
    } else {
      setShowCustom(false);
      setSelectedPreset(key);
      onDateRangeChange(presets[key].getRange());
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onDateRangeChange({
        start: new Date(customStart),
        end: new Date(customEnd),
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-neutral-400" />
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(presets) as PresetKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handlePresetClick(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedPreset === key
                  ? "bg-orange-500 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {presets[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustom && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-10 w-80">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">
            Custom Date Range
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
                className="flex-1 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 px-4 py-2 bg-white text-neutral-700 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
