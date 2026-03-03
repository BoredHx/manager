
'use client';

import React from 'react';
import type { Shift } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MONTHS_2026 = [
  { name: 'January', index: 0 }, { name: 'February', index: 1 }, { name: 'March', index: 2 },
  { name: 'April', index: 3 }, { name: 'May', index: 4 }, { name: 'June', index: 5 },
  { name: 'July', index: 6 }, { name: 'August', index: 7 }, { name: 'September', index: 8 },
  { name: 'October', index: 9 }, { name: 'November', index: 10 }, { name: 'December', index: 11 },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarGrid({ schedule, onDateClick }: { schedule: Record<string, Shift>; onDateClick: (date: string) => void }) {
  const renderMonth = (monthName: string, monthIndex: number) => {
    const year = 2026;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const days = [];
    
    // Empty cells for the first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${monthIndex}-${i}`} className="h-14 bg-muted/20" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const shift = schedule[dateKey];
      days.push(
        <div 
          key={dateKey} 
          onClick={() => onDateClick(dateKey)} 
          className={cn(
            "h-14 border p-1 text-[10px] cursor-pointer hover:bg-accent/10 transition-colors relative group", 
            shift?.hasShift ? 'bg-emerald-50' : ''
          )}
        >
          <span className="font-semibold text-muted-foreground group-hover:text-primary">{d}</span>
          {shift?.hasShift && (
            <div className="mt-1 bg-primary text-primary-foreground rounded-sm px-1 overflow-hidden whitespace-nowrap text-[8px] leading-tight">
              {shift.startTime}
              <br/>
              {shift.employees}x staff
            </div>
          )}
        </div>
      );
    }

    return (
      <Card key={`${monthName}-${monthIndex}`} className="mb-4 shadow-sm">
        <CardHeader className="py-2 px-3 bg-secondary/30">
          <CardTitle className="text-sm font-bold text-primary">{monthName}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-t">
            {DAY_LABELS.map((d, i) => (
              <div key={`${monthName}-${monthIndex}-header-${i}`} className="text-center py-1 font-bold text-[10px] bg-muted/10 border-b text-muted-foreground">
                {d}
              </div>
            ))}
            {days}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
      {MONTHS_2026.map(m => renderMonth(m.name, m.index))}
    </div>
  );
}
