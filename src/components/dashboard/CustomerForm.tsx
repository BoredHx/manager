
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { 
  Customer, 
  STATES, 
  CUSTOMER_TYPES, 
  CONTRACT_VALIDITY,
  REFERRAL_SOURCES
} from '@/lib/types';

export function CustomerForm({ 
  customer, 
  onChange,
  onAiAssist 
}: { 
  customer: Customer; 
  onChange: (c: Customer) => void;
  onAiAssist: () => void;
}) {
  const update = (key: keyof Customer, val: any) => {
    onChange({ ...customer, [key]: val });
  };

  const copyToBilling = () => {
    onChange({
      ...customer,
      billingName: customer.communityName,
      billingEmail: customer.email,
      billingStreet1: customer.locStreet1,
      billingStreet2: customer.locStreet2,
      billingCity: customer.locCity,
      billingState: customer.locState,
      billingZip: customer.locZip,
      billingPhone: customer.primaryPhone
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="space-y-4 col-span-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Profile & Identity</h3>
            <div className="flex items-center gap-2">
              <Checkbox id="subLoc" checked={customer.isSubLocation} onCheckedChange={(c) => update('isSubLocation', !!c)} />
              <Label htmlFor="subLoc">Sub-Location?</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Community Name</Label>
              <Input value={customer.communityName} onChange={e => update('communityName', e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>Overview</Label>
                <Button variant="ghost" size="sm" onClick={onAiAssist} className="h-6 text-[10px] gap-1 text-accent hover:text-accent">
                  <Sparkles className="w-3 h-3" /> AI Assist
                </Button>
              </div>
              <Input value={customer.overview} onChange={e => update('overview', e.target.value)} placeholder="Draft a brief overview..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={customer.customerType || ""} onValueChange={v => update('customerType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{CUSTOMER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Source</Label>
              <Select value={customer.referralSource || ""} onValueChange={v => update('referralSource', v)}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>{REFERRAL_SOURCES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Validity</Label>
              <Select value={customer.contractValidity || ""} onValueChange={v => update('contractValidity', v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{CONTRACT_VALIDITY.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label># Locations</Label>
              <Input type="number" value={customer.numberOfLocations} onChange={e => update('numberOfLocations', parseInt(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold border-b pb-2 uppercase tracking-wider text-primary">Service Location</h3>
          <div className="space-y-2">
            <Label>Full Address String</Label>
            <Input value={customer.locationFull} onChange={e => update('locationFull', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Street 1</Label><Input value={customer.locStreet1} onChange={e => update('locStreet1', e.target.value)} /></div>
            <div><Label>Street 2</Label><Input value={customer.locStreet2} onChange={e => update('locStreet2', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>City</Label><Input value={customer.locCity} onChange={e => update('locCity', e.target.value)} /></div>
            <div>
              <Label>State</Label>
              <Select value={customer.locState || ""} onValueChange={v => update('locState', v)}>
                <SelectTrigger><SelectValue placeholder="ST" /></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Zip</Label><Input value={customer.locZip} onChange={e => update('locZip', e.target.value)} /></div>
          </div>
        </div>

        {/* Billing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Billing Details</h3>
            <Button variant="link" size="sm" onClick={copyToBilling} className="h-auto p-0 text-xs">Same as location</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Billing Name</Label><Input value={customer.billingName} onChange={e => update('billingName', e.target.value)} /></div>
            <div><Label>Billing Email</Label><Input value={customer.billingEmail} onChange={e => update('billingEmail', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2"><Label>Billing Street</Label><Input value={customer.billingStreet1} onChange={e => update('billingStreet1', e.target.value)} /></div>
            <div><Label>Zip</Label><Input value={customer.billingZip} onChange={e => update('billingZip', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>City</Label><Input value={customer.billingCity} onChange={e => update('billingCity', e.target.value)} /></div>
            <div>
              <Label>State</Label>
              <Select value={customer.billingState || ""} onValueChange={v => update('billingState', v)}>
                <SelectTrigger><SelectValue placeholder="ST" /></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Phone</Label><Input type="number" value={customer.billingPhone || ""} onChange={e => update('billingPhone', e.target.value)} /></div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
             <Label>Primary Phone</Label>
             <Input value={customer.primaryPhone} onChange={e => update('primaryPhone', e.target.value)} />
          </div>
          <div className="space-y-1">
             <Label>Primary Email</Label>
             <Input type="email" value={customer.email} onChange={e => update('email', e.target.value)} />
          </div>
        </div>

        {/* Pricing Logic */}
        <div className="col-span-2 bg-secondary/30 p-4 rounded-xl space-y-4">
          <h3 className="text-sm font-bold border-b border-primary/20 pb-2 uppercase tracking-wider text-primary">Dynamic Pricing</h3>
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between">
                <Label className="text-lg">Base Rate (1Y): <span className="text-primary font-bold text-xl">${customer.price1y}</span></Label>
              </div>
              <Slider 
                min={15} 
                max={100} 
                step={0.25} 
                value={[customer.price1y]} 
                onValueChange={(v) => update('price1y', v[0])} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">2-Year Rate (-2%)</p>
                <p className="text-lg font-bold text-primary">${(customer.price1y * 0.98).toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center shadow-sm">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">3-Year Rate (-4%)</p>
                <p className="text-lg font-bold text-primary">${(customer.price1y * 0.96).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional */}
        <div className="col-span-2 space-y-2">
          <Label>Additional Notes</Label>
          <Textarea value={customer.notes} onChange={e => update('notes', e.target.value)} className="min-h-[100px]" />
        </div>
      </div>
    </div>
  );
}
