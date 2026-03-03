'use client';

import React from 'react';
import type { Customer } from '@/lib/types';
import { format } from 'date-fns';

const LOGO_URL = "https://images.squarespace-cdn.com/content/v1/5d7d3ee9449c8406a3cae3a8/70b8519c-192a-4212-9b9b-886f25b997f5/The+Pool+Attendant+Company+%28500+x+200+px%29+%281%29.png?format=1500w";

export function AgreementPreview({ customer }: { customer: Customer }) {
  const p1 = customer.price1y || 30;
  const p2 = p1 * 0.98;
  const p3 = p1 * 0.96;
  
  const fmtMoney = (n: number) => <span className="bold">{'$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  const fmtDate = (d: string) => d ? format(new Date(d + 'T12:00:00'), 'MMMM do, yyyy') : "TBD";
  
  const scheduleData = Object.values(customer.schedule).filter(s => s.hasShift);
  const totalHours = scheduleData.reduce((acc, s) => acc + (s.hours || 0) * (s.employees || 1), 0);
  const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const tableRows = mNames.map((name, i) => {
    const shifts = scheduleData.filter(s => new Date(s.date! + 'T12:00:00').getMonth() === i);
    if (shifts.length === 0) return null;
    const hours = shifts.reduce((acc, s) => acc + (s.hours || 0) * (s.employees || 1), 0);
    return (
      <tr key={name}>
        <td>{name}</td>
        <td>{shifts.length}</td>
        <td>{hours.toFixed(1)}</td>
        <td>{fmtMoney(hours * p1)}</td>
      </tr>
    );
  }).filter(Boolean);

  const totalRow = (
    <tr className="bg-slate-100 font-bold">
      <td>TOTALS</td>
      <td>{scheduleData.length} Days</td>
      <td>{totalHours.toFixed(1)} Hours</td>
      <td>{fmtMoney(totalHours * p1)}</td>
    </tr>
  );

  const genCal = (startM: number, endM: number) => (
    <div className="sched-grid">
      {Array.from({ length: endM - startM + 1 }, (_, i) => {
        const mIdx = startM + i;
        const daysInMonth = new Date(2026, mIdx + 1, 0).getDate();
        const firstDay = new Date(2026, mIdx, 1).getDay();
        const days = [];
        for (let p = 0; p < firstDay; p++) days.push(<div key={`p-${mIdx}-${p}`} className="bg-slate-50 border border-slate-100 h-[35px]" />);
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `2026-${(mIdx + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          const s = customer.schedule[dateStr];
          days.push(
            <div key={dateStr} className={`border p-1 h-[35px] overflow-hidden ${s?.hasShift ? 'bg-green-50 border-green-400' : 'bg-white border-slate-100'}`}>
              <span className="text-[8px] text-slate-400 block leading-none">{d}</span>
              {s?.hasShift && <div className="text-[8px] leading-tight font-sans text-center">{s.startTime}<br/>{s.employees}x</div>}
            </div>
          );
        }
        return (
          <div key={mIdx} className="border border-slate-300 break-inside-avoid">
            <div className="bg-slate-800 text-white text-center py-0.5 font-bold text-[10px] uppercase">{mNames[mIdx]}</div>
            <div className="grid grid-cols-7 gap-[1px] bg-slate-100">
              {days}
            </div>
          </div>
        );
      })}
    </div>
  );

  const genList = (startM: number, endM: number) => (
    <div className="sched-grid">
      {Array.from({ length: endM - startM + 1 }, (_, i) => {
        const mIdx = startM + i;
        const monthShifts = Object.entries(customer.schedule)
          .filter(([date, s]) => s.hasShift && new Date(date + 'T12:00:00').getMonth() === mIdx)
          .sort((a, b) => a[0].localeCompare(b[0]));
        return (
          <div key={mIdx} className="border border-slate-300 break-inside-avoid">
            <div className="bg-slate-800 text-white text-center py-0.5 font-bold text-[10px] uppercase">{mNames[mIdx]}</div>
            <div className="p-1 space-y-0.5">
              {monthShifts.map(([date, s]) => (
                <div key={date} className="flex justify-between border-b border-slate-50 text-[9px] font-sans">
                  <span className="font-bold">{parseInt(date.split('-')[2])}</span>
                  <span>{s.startTime}-{s.endTime} ({s.employees})</span>
                </div>
              ))}
              {monthShifts.length === 0 && <div className="text-slate-300 italic text-[9px] font-sans text-center">No Shifts</div>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPage = (pageNum: number, content: React.ReactNode) => (
    <div className="print-page">
      <img src={LOGO_URL} className="watermark" alt="TPAC Watermark" />
      <div className="header-area">
        <span className="bold uppercase">{customer.communityName}</span>
        <span className="italic uppercase">Agreement</span>
      </div>
      <div className="content-area">
        {content}
      </div>
      <div className="footer-area">
        <span className="bold uppercase">The Pool Attendant Company</span>
        <span className="bold uppercase">Page {pageNum} of 15</span>
      </div>
    </div>
  );

  return (
    <div className="printable-area hidden">
      <style>{`
        @page { size: letter; margin: 0; }
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            background: #fff; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
        }
        .print-page {
          width: 8.5in;
          height: 11in;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 0.6in 0.75in 0.4in 0.75in;
          box-sizing: border-box;
          page-break-after: always;
          background: #fff;
          color: #000;
          font-family: 'Times New Roman', serif;
          font-size: 11.5pt;
          line-height: 1.3;
        }
        .header-area { 
          display: flex; 
          justify-content: space-between; 
          border-bottom: 2px solid #000; 
          margin-bottom: 15px; 
          padding-bottom: 5px; 
          font-size: 11pt; 
          font-weight: bold;
        }
        .footer-area { 
          border-top: 2px solid #000; 
          padding-top: 8px; 
          font-size: 10pt; 
          display: flex; 
          justify-content: space-between; 
          margin-top: 15px;
          font-weight: bold;
        }
        .watermark { 
          position: absolute; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%); 
          width: 80%; 
          opacity: 0.08; 
          z-index: 1; 
          pointer-events: none; 
        }
        .bold { font-weight: bold; }
        .fill-label { font-size: 14pt; font-weight: bold; margin-bottom: 8px; display: block; }
        .center { text-align: center; }
        .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 6px; margin-top: 15px; font-size: 12.5pt; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin: 10px 0; }
        th, td { border: 1.5px solid #000; padding: 5px; text-align: center; }
        th { background: #f0f0f0; font-weight: bold; }
        .sched-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 10px; }
        p, li { margin-bottom: 8px; text-align: justify; }
      `}</style>

      {renderPage(1, (
        <>
          <div className="center mb-8">
            <div className="bold" style={{ fontSize: '20pt' }}>Service Agreement</div>
            <div className="bold" style={{ fontSize: '16pt' }}>The Pool Attendant Company</div>
            <div style={{ marginTop: '15px', fontSize: '14pt' }}>for the consideration of: <span className="bold underline">{customer.communityName}</span></div>
          </div>
          <div className="fill-label">Community Address(es): <span className="underline">{customer.locationFull || "________________________________"}</span></div>
          <div className="fill-label">2026 Season Start Date: <span className="underline">{fmtDate(customer.startDate)}</span></div>
          <div className="fill-label">2026 Season End Date: <span className="underline">{fmtDate(customer.endDate)}</span></div>
          <p>This Agreement is made and entered into by and between <span className="bold">{customer.communityName}</span>, hereinafter referred to as "THE ASSOCIATION," and THE POOL ATTENDANT COMPANY (TPAC), hereinafter referred to as "TPAC."</p>
          <p>WHEREAS, THE ASSOCIATION has chosen to enter into an agreement with TPAC to provide certain amenity monitoring and pool attendant staffing services for the benefit of The Association Members.</p>
          <div className="section-title">1.0 TPAC SERVICE RESPONSIBILITIES INTRODUCTION</div>
          <p>TPAC shall be responsible for all aspects of staffing operations, including recruitment, background checks, drug testing, training, payroll, and employee management. This includes all associated expenses such as payroll taxes, sales taxes, and corporate taxes related to performing services under this Agreement. TPAC shall ensure all staff are properly trained in accordance with the responsibilities outlined herein. TPAC must ensure that no employee elected to perform the duties found within this agreement is deployed to property of The Association who (1) is under eighteen (18) years of age, (2) Possesses a criminal background with violent, sexual, or felony offenses and offenses that could be deemed a threat to the safety of The Association, (3) has offensive or excessive body tattooing that cannot be concealed during their shift, or (4) lacks the appropriate training and/or experience in a related field or of the duties disclosed within this agreement.</p>
        </>
      ))}

      {renderPage(2, (
        <>
          <div className="section-title">1.1 SCOPE OF SERVICES</div>
          <p>This section outlines the specific services that The Pool Attendant Company ("TPAC") will provide under this Service Agreement, detailing the roles and responsibilities of its attendants and the insurance coverage it will maintain.</p>
          <div className="section-title">1.2 AMENITY MONITORING SERVICES PROVIDED BY TPAC</div>
          <p>TPAC commits to delivering a comprehensive array of services through trained pool attendants who are W2 employees. The following services are included:</p>
          <p><span className="bold">1.2.a Guest Sign-In:</span> Attendants will greet guests and require them to sign in upon entry to the amenity area, promoting security and maintaining accurate attendance records.</p>
          <p><span className="bold">1.2.b Behavioral Monitoring:</span> Attendants will oversee guest behavior to ensure adherence to community rules. This includes vigilance to identify and proactively address potential safety issues.</p>
          <p><span className="bold">1.2.c Conflict Monitoring and Response:</span> In the event that conflicts or undesirable behavior arise, TPAC attendants are trained to de-escalate situations effectively by verbal means, minimizing disruptions and maintaining a pleasant atmosphere.</p>
          <p><span className="bold">1.2.d Communication with Authorities:</span> For situations that necessitate immediate action, including incidents or emergencies, TPAC will contact local authorities as required to ensure the community's safety.</p>
          <p><span className="bold">1.2.e Cleanliness and Organization:</span> Attendants will inspect and maintain the cleanliness of the amenity area, organizing furniture and clearing litter to guarantee that spaces are welcoming and safe for use.</p>
          <p><span className="bold">1.2.f Customer Service Engagement:</span> TPAC attendants will also act as approachable customer service representatives, addressing questions or concerns from residents and guests to enhance their overall experience.</p>
          <p><span className="bold">1.2.g Other Duties:</span> TPAC staff may also engage in other add-on services to include towel service, wristband distribution, kiosk troubleshooting or instruction for patrons, and other services should they be contracted and paid for by The Association.</p>
        </>
      ))}

      {renderPage(3, (
        <>
          <div className="section-title">2.0 INSURANCE</div>
          <p>TPAC shall maintain the following coverage for the duration of the pool season(s) contracted.</p>
          <p><span className="bold">2.1 Workers Compensation:</span> Limits of $100,000 per Accident / $500,000 per Policy.</p>
          <p><span className="bold">2.2 General Liability Insurance:</span> Limits of a minimum $1,000,000 per Occurrence / $2,000,000 Aggregate.</p>
          <p><span className="bold">2.3 Commercial Auto Insurance:</span> Limits of $1,000,000 per Occurrence.</p>
          <p><span className="bold">2.4 Certificates of Insurance:</span> TPAC agrees to supply copies of Certificate of Insurance (Certificate) to THE ASSOCIATION verifying the above-mentioned insurance coverages on the ACORD 25 form. The Certificate should also provide for a written notice of cancellation to Certificate Holder(s) in accordance with the policy provisions. The Pool Attendant Company shall make available to THE ASSOCIATION, through its records or through the records of its insurers, information regarding any specific claim no later than 5 business days after the request.</p>
        </>
      ))}

      {renderPage(4, (
        <>
          <div className="section-title">3.0 NON-SERVICE ELEMENTS</div>
          <p>It is imperative for The Association to understand that TPAC does not include the following services: No Maintenance Service, Not a Lifeguarding Service, No Security Services.</p>
          <div className="section-title">4.0 CONTRACT DURATION</div>
          <p>The duration of amenity monitoring contracts with The Pool Attendant Company ("TPAC") offers flexibility tailored to the specific needs of The Association. Three distinct contract options are available: one-season, two-season, and three-season contracts.</p>
          <p><span className="bold">4.1 One-Season Contract:</span> Duration: 1 Season. Pricing: Please refer to Section 6.1.</p>
          <p><span className="bold">4.2 Two-Season Contract:</span> Duration: 2 Consecutive Seasons. Pricing: {fmtMoney(p2)} per pool attendant hour.</p>
          <p><span className="bold">4.3 Three-Season Contract:</span> Duration: 3 Seasons. Pricing: {fmtMoney(p3)} per pool attendant hour (lowest locked rate).</p>
        </>
      ))}

      {renderPage(5, (
        <>
          <div className="section-title">5.0 PAYMENT TERMS</div>
          <p><span className="bold">5.1 Invoice Issuance:</span> Invoices will be issued by TPAC 30 days prior to the start of the service month.</p>
          <p><span className="bold">5.2 Payment Terms:</span> TPAC operates under upfront net 30 terms, signifying that payments are to be made in full within 30 days of the invoice date.</p>
          <p><span className="bold">5.3 Adjustments for Hour Discrepancies:</span> In situations where there are discrepancies in hours worked totaling 1 hour or more in a specific month, TPAC employs standard procedures for under/overpayment.</p>
          <p><span className="bold">5.4 Late Payment Terms and Penalties:</span> Late Payment Penalties: All payments received seven (7) days after their due date shall incur a 3% fee. Service Suspension: Should an invoice go beyond fourteen (14) days past its due date, TPAC reserves the right to choose to withhold services.</p>
        </>
      ))}

      {renderPage(6, (
        <>
          <div className="section-title">6.0 PRICING STRUCTURE</div>
          <p>This section elaborates on the pricing options available for amenity monitoring contracts with The Pool Attendant Company (TPAC).</p>
          <p><span className="bold">6.1 Individual Seasonal Rates:</span> For communities that opt for a one-season contract, the pricing is as follows:</p>
          <p><span className="bold">2026 Rate:</span> priced at {fmtMoney(p1)}/hr.</p>
          <p><span className="bold">2027 Rate:</span> priced at {fmtMoney(p1 * 1.05)}/hr.</p>
          <p><span className="bold">2028 Rate:</span> priced at {fmtMoney(p1 * 1.10)}/hr.</p>
          <div className="section-title">7.0 TERMINATION</div>
          <p><span className="bold">Early Termination:</span> Either party may terminate by providing written notice: (a) thirty (30) days in advance for single-season; or (b) sixty (60) days for multi-season.</p>
        </>
      ))}

      {renderPage(7, (
        <>
          <div className="section-title">8.0 LIABILITY AND INDEMNIFICATION</div>
          <p><span className="bold">8.1 Liability:</span> TPAC shall remain liable for actions and negligence of its employees. However, TPAC assumes no liability for inherent property design defects or actions of third parties.</p>
          <p><span className="bold">8.2 Indemnification Provisions:</span> TPAC and The Association agree to mutual indemnification for claims arising from their respective performance, except in cases of gross negligence.</p>
        </>
      ))}

      {renderPage(8, (
        <>
          <div className="section-title">9.0 COMPLIANCE WITH LAWS</div>
          <p>Both TPAC and The Association shall fully adhere to all relevant local, state, and federal laws, maintaining all required licenses and insurance coverage.</p>
          <div className="section-title">10.0 DISPUTE RESOLUTION</div>
          <p>Prior to commencing legal action, the parties shall attempt to resolve any disputes through mediation, followed by binding arbitration if necessary.</p>
        </>
      ))}

      {renderPage(9, (
        <>
          <div className="section-title">11.0 CONFIDENTIALITY</div>
          <p>Both parties shall protect confidential information received during this Agreement for a period of two (2) years after termination.</p>
          <div className="section-title">12.0 MISCELLANEOUS PROVISIONS</div>
          <p>This Agreement may be modified only by written amendment. This Agreement shall be governed by the laws of the state in which The Association is located.</p>
        </>
      ))}

      {renderPage(10, (
        <>
          <div className="center bold mb-6" style={{ fontSize: '14pt' }}>CONTRACT DURATION AND PRICING SELECTION</div>
          <p>It shall be assumed that the season duration contracted for the 2026 pool season shall be mirrored similarly to consecutive seasons.</p>
          <div className="bold">Select contract term (initial one):</div>
          <div style={{ marginLeft: '20px', lineHeight: '2.5' }}>
            ☐ One Season - Initial Date: {fmtDate(customer.startDate)} | Priced at {fmtMoney(p1)}/hr.<br/>
            ☐ Two Seasons - Initial Date: {fmtDate(customer.startDate)} | Priced at {fmtMoney(p2)}/hr.<br/>
            ☐ Three Seasons - Initial Date: {fmtDate(customer.startDate)} | Priced at {fmtMoney(p3)}/hr.
          </div>
          <div className="bold mt-4">Limitations</div>
          <p>The total hourly labor volume for one season is <span className="underline">&nbsp;{totalHours.toFixed(1)}&nbsp;</span> pool attendant hours. The Association may adjust staffing schedules without penalty, provided that the overall volume does not decrease by more than 20% of the originally contracted total.</p>
        </>
      ))}

      {renderPage(11, (
        <>
          <div className="section-title">13.0 SIGNATURES</div>
          <div className="mt-6">
            <div className="fill-label">{customer.communityName} (The Association)</div>
            <p className="fill-label">Full Name & Title: ________________________________________________</p>
            <p className="fill-label">Signature: _______________________________________________________</p>
            <p className="fill-label">Date: __________________________</p>
          </div>
          <div className="mt-10">
            <div className="fill-label">The Pool Attendant Company (TPAC)</div>
            <p className="fill-label">Full Name & Title: ________________________________________________</p>
            <p className="fill-label">Signature: _______________________________________________________</p>
            <p className="fill-label">Date: __________________________</p>
          </div>
          <p className="mt-6 italic text-sm">By executing the above, the parties acknowledge and agree that this agreement is effective, binding, and enforceable as of this date.</p>
        </>
      ))}

      {renderPage(12, (
        <>
          <div className="center bold" style={{ fontSize: '15pt' }}>APPENDIX A: ESTIMATED COSTS</div>
          <table>
            <thead><tr><th>Month</th><th>Days</th><th>Hours</th><th>Price</th></tr></thead>
            <tbody>{tableRows}{totalRow}</tbody>
          </table>
          <p className="bold mt-6">Notes: <span className="underline">{customer.notes || "None"}</span></p>
        </>
      ))}

      {renderPage(13, (
        <>
          <div className="center bold uppercase mb-6">Schedule Overview (Jan - Jun)</div>
          {genCal(0, 5)}
        </>
      ))}

      {renderPage(14, (
        <>
          <div className="center bold uppercase mb-6">Schedule Overview (Jul - Dec)</div>
          {genCal(6, 11)}
        </>
      ))}

      {renderPage(15, (
        <>
          <div className="center bold uppercase mb-6">Shift Details (Jan - Jun)</div>
          {genList(0, 5)}
        </>
      ))}
    </div>
  );
}