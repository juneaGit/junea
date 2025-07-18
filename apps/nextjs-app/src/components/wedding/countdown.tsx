'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

interface CountdownProps {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown = ({ targetDate, className }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Jours' },
    { value: timeLeft.hours, label: 'Heures' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Secondes' },
  ];

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop : Grid horizontal */}
      <div className="hidden sm:grid sm:grid-cols-4 sm:gap-2 md:gap-4">
        {timeUnits.map((unit, index) => (
          <div key={index} className="text-center">
            <div className="relative overflow-hidden rounded-xl bg-white/20 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:scale-105">
              <div className="text-2xl font-bold leading-none transition-all duration-500">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="mt-1 text-xs font-medium opacity-90">
                {unit.label}
              </div>
              {/* Petit effet sparkle */}
              <div className="absolute top-1 right-1 size-2 rounded-full bg-white/40 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile : Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {timeUnits.map((unit, index) => (
          <div key={index} className="text-center">
            <div className="relative overflow-hidden rounded-xl bg-white/20 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/30">
              <div className="text-xl font-bold leading-none transition-all duration-500">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="mt-1 text-xs font-medium opacity-90">
                {unit.label}
              </div>
              <div className="absolute top-1 right-1 size-2 rounded-full bg-white/40 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
