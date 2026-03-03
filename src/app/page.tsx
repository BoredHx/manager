'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  Search, 
  Plus, 
  Save, 
  Printer, 
  Calendar, 
  Loader2,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

import type { Customer, Shift } from '@/lib/types';
import { CustomerForm } from '@/components/dashboard/CustomerForm';
import { CalendarGrid } from '@/components/dashboard/CalendarGrid';
import { DayModal, WeeklyTemplateModal } from '@/components/dashboard/ScheduleModals';
import { AgreementPreview } from '@/components/dashboard/AgreementPreview';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // SWR for customers list
  const { data: searchResults = [], isLoading: listLoading } = useSWR<Customer[]>(
    debouncedQuery ? `/api/customers?q=${debouncedQuery}` : '/api/customers',
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCustomer = (customer: Customer) => {
    if (isUnsaved && !confirm('Discard unsaved changes?')) return;
    setCurrentCustomer(customer);
    setIsUnsaved(false);
  };

  const handleNewCustomer = () => {
    const newCust: Customer = {
      id: '',
      communityName: 'New Community',
      overview: '',
      customerType: '',
      referralSource: '',
      contractValidity: 'Active',
      numberOfLocations: 1,
      isSubLocation: false,
      email: '',
      primaryPhone: '',
      billingName: '',
      billingEmail: '',
      billingPhone: '',
      billingStreet1: '',
      billingStreet2: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      locationFull: '',
      locStreet1: '',
      locStreet2: '',
      locCity: '',
      locState: '',
      locZip: '',
      services: [],
      startDate: '',
      endDate: '',
      notes: '',
      price1y: 30,
      monthlyHours: Array(12).fill(0),
      schedule: {}
    };
    setCurrentCustomer(newCust);
    setIsUnsaved(true);
  };

  const handleSave = async () => {
    if (!currentCustomer) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(currentCustomer)
      });
      const saved = await res.json();
      if (saved.error) throw new Error(saved.error);
      
      setCurrentCustomer(saved);
      setIsUnsaved(false);
      mutate('/api/customers');
      toast({ title: 'Changes saved successfully' });
    } catch (e: any) {
      toast({ title: 'Error saving changes', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTemplate = (start: string, end: string, template: Record<string, Shift>) => {
    if (!currentCustomer) return;
    const newSchedule = { ...currentCustomer.schedule };
    let curr = new Date(start + 'T12:00:00');
    const stop = new Date(end + 'T12:00:00');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    while (curr <= stop) {
      const y = curr.getFullYear();
      const m = (curr.getMonth() + 1).toString().padStart(2, '0');
      const d = curr.getDate().toString().padStart(2, '0');
      const dKey = `${y}-${m}-${d}`;
      
      const dName = dayNames[curr.getDay()];
      const t = template[dName];
      
      if (t.hasShift) {
        const parseTime = (timeStr: string) => {
          const [time, ampm] = timeStr.split(' ');
          let [h, min] = time.split(':').map(Number);
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return h + min / 60;
        };
        const h1 = parseTime(t.startTime!);
        const h2 = parseTime(t.endTime!);
        let diff = h2 - h1;
        if (diff < 0) diff += 24;
        newSchedule[dKey] = { ...t, hours: diff, date: dKey };
      } else {
        newSchedule[dKey] = { hasShift: false, hours: 0, date: dKey };
      }
      curr.setDate(curr.getDate() + 1);
    }

    setCurrentCustomer({ ...currentCustomer, schedule: newSchedule });
    setIsUnsaved(true);
    setWeeklyModalOpen(false);
  };

  const totals = useMemo(() => {
    if (!currentCustomer) return { hours: 0, cost1: 0, cost2: 0, cost3: 0 };
    const hours = Object.values(currentCustomer.schedule).reduce((acc, s) => {
      if (s.hasShift && s.hours) {
        acc += s.hours * (s.employees || 1);
      }
      return acc;
    }, 0);
    const price = currentCustomer.price1y;
    return {
      hours,
      cost1: hours * price,
      cost2: hours * price * 0.98,
      cost3: hours * price * 0.96
    };
  }, [currentCustomer]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body">
      <Toaster />
      
      <div className="w-80 border-r bg-white flex flex-col no-print shrink-0">
        <div className="p-4 bg-primary text-white flex items-center justify-between shadow-sm">
          <span className="font-bold tracking-tight text-lg">AttendantDesk</span>
          <Button variant="ghost" size="icon" onClick={handleNewCustomer} className="text-white hover:bg-primary/80">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search communities..." 
              className="pl-9 h-9 bg-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {searchResults.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectCustomer(c)}
                className={`w-full text-left p-3 rounded-lg transition-all group border border-transparent ${currentCustomer?.id === c.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/60'}`}
              >
                <div className="font-semibold text-sm group-hover:text-primary">{c.communityName}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{c.locCity}, {c.locState}</div>
              </button>
            ))}
            {listLoading && (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary opacity-50" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col no-print min-w-0">
        {currentCustomer ? (
          <>
            <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-4 overflow-hidden">
                <h1 className="text-xl font-bold text-primary truncate">{currentCustomer.communityName}</h1>
                {isUnsaved && <Badge variant="destructive" className="animate-pulse gap-1"><AlertTriangle className="w-3 h-3" /> Unsaved Changes</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 font-semibold">
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary font-bold">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All
                </Button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <ScrollArea className="flex-1 p-6 bg-slate-50/40">
                <div className="max-w-4xl mx-auto">
                  <CustomerForm 
                    customer={currentCustomer} 
                    onChange={(c) => { setCurrentCustomer(c); setIsUnsaved(true); }}
                    onAiAssist={() => {}} 
                  />
                </div>
              </ScrollArea>

              <div className="w-[400px] border-l bg-white flex flex-col shrink-0">
                <div className="p-4 bg-secondary/20 flex items-center justify-between border-b">
                  <h2 className="font-bold flex items-center gap-2 text-primary">
                    <Calendar className="w-4 h-4" /> 2026 Season
                  </h2>
                  <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => setWeeklyModalOpen(true)}>Master Template</Button>
                </div>
                
                <div className="flex-1 overflow-hidden p-4">
                  <CalendarGrid 
                    schedule={currentCustomer.schedule} 
                    onDateClick={(d) => { setSelectedDate(d); setDayModalOpen(true); }} 
                  />
                </div>

                <div className="p-4 border-t bg-slate-50 shrink-0 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold border-b pb-2">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="text-primary">{totals.hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 border bg-white rounded-lg text-center shadow-sm">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">1Y Cost</p>
                      <p className="text-xs font-bold text-primary">${totals.cost1.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="p-2 border bg-white rounded-lg text-center shadow-sm">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">2Y Cost</p>
                      <p className="text-xs font-bold text-emerald-600">${totals.cost2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="p-2 border bg-white rounded-lg text-center shadow-sm">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">3Y Cost</p>
                      <p className="text-xs font-bold text-emerald-700">${totals.cost3.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 ring-8 ring-primary/5 animate-pulse">
              <FileCheck className="w-12 h-12 text-primary/40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Manager Dashboard</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">Search for a community to manage schedules and generate agreements.</p>
            <Button onClick={handleNewCustomer} className="bg-primary h-12 px-8 font-bold">
              <Plus className="w-5 h-5 mr-2" /> Add New Community
            </Button>
          </div>
        )}
      </div>

      {dayModalOpen && selectedDate && (
        <DayModal 
          isOpen={dayModalOpen} 
          onClose={() => setDayModalOpen(false)}
          date={selectedDate}
          shift={currentCustomer?.schedule[selectedDate]}
          onSave={(shift) => {
            if (!currentCustomer) return;
            const updatedSchedule = { ...currentCustomer.schedule, [selectedDate]: { ...shift, date: selectedDate } };
            setCurrentCustomer({ ...currentCustomer, schedule: updatedSchedule });
            setIsUnsaved(true);
            setDayModalOpen(false);
          }}
        />
      )}
      
      <WeeklyTemplateModal 
        isOpen={weeklyModalOpen} 
        onClose={() => setWeeklyModalOpen(false)}
        onApply={handleApplyTemplate}
      />

      {currentCustomer && <AgreementPreview customer={currentCustomer} />}
    </div>
  );
}
