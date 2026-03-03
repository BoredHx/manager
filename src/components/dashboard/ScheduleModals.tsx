
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Shift } from '@/lib/types';

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm} ${ampm}`;
});

function calculateHours(start: string, end: string) {
  const parseTime = (t: string) => {
    const [time, ampm] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h + m / 60;
  };
  const h1 = parseTime(start);
  const h2 = parseTime(end);
  let diff = h2 - h1;
  if (diff < 0) diff += 24;
  return diff;
}

export function DayModal({ isOpen, onClose, date, shift, onSave }: { isOpen: boolean; onClose: () => void; date: string; shift?: Shift; onSave: (s: Shift) => void }) {
  const [data, setData] = useState<Shift>({ hasShift: false, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1, date });

  useEffect(() => {
    if (shift) setData(shift);
    else setData({ hasShift: false, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1, date });
  }, [shift, date]);

  const handleSave = () => {
    const hours = calculateHours(data.startTime!, data.endTime!);
    onSave({ ...data, hours });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift: {date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasShift" checked={data.hasShift} onCheckedChange={(c) => setData({ ...data, hasShift: !!c })} />
            <Label htmlFor="hasShift" className="text-sm font-bold text-primary">Shift Scheduled</Label>
          </div>
          {data.hasShift && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select value={data.startTime} onValueChange={(v) => setData({ ...data, startTime: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select value={data.endTime} onValueChange={(v) => setData({ ...data, endTime: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Staff Count (Employees)</Label>
                <Input type="number" value={data.employees} onChange={(e) => setData({ ...data, employees: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-primary">Update Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WeeklyTemplateModal({ isOpen, onClose, onApply }: { isOpen: boolean; onClose: () => void; onApply: (start: string, end: string, template: Record<string, Shift>) => void }) {
  const [range, setRange] = useState({ start: '2026-05-01', end: '2026-09-07' });
  const [template, setTemplate] = useState<Record<string, Shift>>({
    'Sun': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
    'Mon': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
    'Tue': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
    'Wed': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
    'Thu': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
    'Fri': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
    'Sat': { hasShift: true, startTime: '09:00 AM', endTime: '05:00 PM', employees: 1 },
  });

  const updateTemplate = (day: string, updates: Partial<Shift>) => {
    setTemplate({ ...template, [day]: { ...template[day], ...updates } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Weekly Master Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-lg">
            <Label className="font-bold text-primary">From:</Label>
            <Input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} />
            <Label className="font-bold text-primary">To:</Label>
            <Input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} />
          </div>
          <div className="grid grid-cols-7 gap-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={cn("p-3 border rounded-lg text-center transition-all shadow-sm", template[day].hasShift ? 'bg-primary/5 border-primary' : 'bg-muted/40')}>
                <div className="flex flex-col items-center gap-2 mb-3">
                  <Label className="font-bold text-xs">{day}</Label>
                  <Checkbox checked={template[day].hasShift} onCheckedChange={(c) => updateTemplate(day, { hasShift: !!c })} />
                </div>
                {template[day].hasShift && (
                  <div className="space-y-2">
                    <Select value={template[day].startTime} onValueChange={v => updateTemplate(day, { startTime: v })}>
                      <SelectTrigger className="h-7 text-[10px] px-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-40">
                        {TIME_OPTIONS.map(t => <SelectItem key={t} value={t} className="text-[10px]">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={template[day].endTime} onValueChange={v => updateTemplate(day, { endTime: v })}>
                      <SelectTrigger className="h-7 text-[10px] px-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-40">
                        {TIME_OPTIONS.map(t => <SelectItem key={t} value={t} className="text-[10px]">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold">Employees</Label>
                      <Input 
                        type="number" 
                        value={template[day].employees} 
                        onChange={(e) => updateTemplate(day, { employees: parseInt(e.target.value) || 1 })} 
                        className="h-7 text-xs text-center border-primary/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onApply(range.start, range.end, template)} className="bg-primary font-bold">Apply Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
