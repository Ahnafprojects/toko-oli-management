'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  X,
} from 'lucide-react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { id } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);

  React.useEffect(() => {
    setTempDate(date);
  }, [date]);

  const handleApply = () => {
    setDate(tempDate);
    setPopoverOpen(false);
  };

  const handleClear = () => setTempDate(undefined);
  const handleCancel = () => {
    setTempDate(date);
    setPopoverOpen(false);
  };

  const presets = [
    {
      label: 'Hari ini',
      range: { from: new Date(), to: new Date() },
      icon: '📅',
    },
    {
      label: '7 hari terakhir',
      range: { from: subDays(new Date(), 6), to: new Date() },
      icon: '📊',
    },
    {
      label: 'Minggu ini',
      range: {
        from: startOfWeek(new Date(), { locale: id }),
        to: endOfWeek(new Date(), { locale: id }),
      },
      icon: '📈',
    },
    {
      label: 'Bulan ini',
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      },
      icon: '📋',
    },
    {
      label: '30 hari terakhir',
      range: { from: subDays(new Date(), 29), to: new Date() },
      icon: '📆',
    },
  ];

  const getDisplayLabel = () => {
    if (!date?.from) return 'Pilih rentang tanggal';
    if (date.to) {
      for (const preset of presets) {
        if (
          date.from.toDateString() === preset.range.from.toDateString() &&
          date.to.toDateString() === preset.range.to.toDateString()
        ) {
          return `${preset.icon} ${preset.label} (${format(
            date.from,
            'd MMM yyyy',
            { locale: id }
          )} - ${format(date.to, 'd MMM yyyy', { locale: id })})`;
        }
      }

      return `${format(date.from, 'd MMM yyyy', {
        locale: id,
      })} - ${format(date.to, 'd MMM yyyy', { locale: id })}`;
    }

    return format(date.from, 'd MMM yyyy', { locale: id });
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'min-w-[260px] text-xs justify-between border hover:border-blue-400 px-3 py-2 rounded-md shadow-sm transition-colors',
              !date && 'text-muted-foreground',
              date && 'border-blue-300 bg-blue-50/50'
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">{getDisplayLabel()}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          className="w-full max-w-[520px] p-0 bg-white border rounded-lg shadow-xl"
        >
          <div className="flex flex-col md:flex-row max-h-[460px] overflow-hidden">
            {/* Sidebar Preset */}
            <div className="w-full md:w-[160px] border-r border-gray-200 bg-white">
              <div className="p-3 border-b text-xs font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Cepat
              </div>
              <div className="p-2 space-y-1">
                {presets.map(({ label, range, icon }) => {
                  const isSelected =
                    tempDate?.from?.toDateString() === range.from.toDateString() &&
                    tempDate?.to?.toDateString() === range.to.toDateString();

                  return (
                    <Button
                      key={label}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start text-xs px-2 py-1 rounded-md',
                        isSelected &&
                          'bg-blue-100 text-blue-700 border border-blue-200'
                      )}
                      onClick={() => setTempDate(range)}
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Kalender dan Footer */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center border-b px-3 py-2 text-xs bg-gray-50">
                <span className="font-semibold text-gray-700">Pilih Tanggal</span>
                {tempDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-red-500"
                    onClick={handleClear}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="p-3 overflow-auto">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={tempDate?.from}
                  selected={tempDate}
                  onSelect={setTempDate}
                  numberOfMonths={1}
                  className="rounded-md [&_td]:w-9 [&_td]:h-9 [&_td]:text-sm [&_td]:font-normal"
                />
              </div>

              <div className="border-t px-3 py-2 bg-gray-50 flex justify-between items-center text-xs">
                <div className="text-gray-500">
                  {tempDate?.from && tempDate?.to && (
                    <>
                      {Math.ceil(
                        (tempDate.to.getTime() - tempDate.from.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1}{' '}
                      hari
                    </>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="h-6 px-3 text-[11px]"
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!tempDate?.from}
                    className="h-6 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px]"
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
