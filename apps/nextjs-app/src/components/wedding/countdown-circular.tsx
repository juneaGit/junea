'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

interface CountdownCircularProps {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownCircular = ({ targetDate, className }: CountdownCircularProps) => {
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
    { value: timeLeft.days, label: 'Jours', max: 365, color: 'stroke-pink-500' },
    { value: timeLeft.hours, label: 'Heures', max: 24, color: 'stroke-rose-500' },
    { value: timeLeft.minutes, label: 'Minutes', max: 60, color: 'stroke-pink-400' },
    { value: timeLeft.seconds, label: 'Secondes', max: 60, color: 'stroke-rose-400' },
  ];

  const CircularProgress = ({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-white/20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className={cn(color, 'transition-all duration-1000 ease-out')}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value.toString().padStart(2, '0')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop : 4 cercles en ligne */}
      <div className="hidden sm:flex sm:justify-center sm:space-x-8">
        {timeUnits.map((unit, index) => (
          <div key={index} className="flex flex-col items-center space-y-3">
            <CircularProgress
              value={unit.value}
              max={unit.max}
              color={unit.color}
              size={90}
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-white/90">{unit.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile : 2x2 grid */}
      <div className="grid grid-cols-2 gap-6 sm:hidden">
        {timeUnits.map((unit, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <CircularProgress
              value={unit.value}
              max={unit.max}
              color={unit.color}
              size={80}
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-white/90">{unit.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 