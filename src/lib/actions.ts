'use server';

import type { Customer, Shift } from './types';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK;

const getNotionHeaders = () => ({
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28'
});

function parseShiftString(text: string): Shift | null {
  if (!text || text.trim() === '') return null;
  try {
    const data = JSON.parse(text);
    return {
      hasShift: !!data.hasShift,
      startTime: data.startTime || '09:00 AM',
      endTime: data.endTime || '05:00 PM',
      employees: Number(data.employees) || 1,
      hours: Number(data.hours) || 0,
      date: data.date
    };
  } catch (e) {
    return null;
  }
}

function mapNotionToCustomer(page: any): Customer {
  const props = page.properties;
  const schedule: Record<string, Shift> = {};
  for (const key in props) {
    if (key.length === 10 && key[4] === '-' && key[7] === '-') {
      const textContent = props[key]?.rich_text;
      if (textContent && textContent.length > 0) {
        const plainText = textContent[0]?.plain_text || textContent[0]?.text?.content;
        const shiftData = parseShiftString(plainText || '');
        if (shiftData) schedule[key] = { ...shiftData, date: key };
      }
    }
  }
  return {
    id: page.id,
    communityName: props['Community Name']?.title?.[0]?.plain_text || '',
    overview: props['Overview']?.rich_text?.[0]?.plain_text || '',
    customerType: props['Customer Type']?.select?.name || '',
    referralSource: props['Referral Source']?.select?.name || '',
    contractValidity: props['Contract Validity']?.select?.name || '',
    numberOfLocations: props['# of Locations']?.number || 1,
    isSubLocation: props['Sub-Location?']?.checkbox || false,
    email: props['Email']?.email || '',
    primaryPhone: props['Primary Phone Number']?.phone_number || '',
    billingName: props['Billing Name']?.rich_text?.[0]?.plain_text || '',
    billingEmail: props['Billing Email']?.email || '',
    billingPhone: props['Billing Phone Number']?.number?.toString() || '',
    billingStreet1: props['Billing Street']?.rich_text?.[0]?.plain_text || '',
    billingStreet2: props['Billing Street 2nd Line']?.rich_text?.[0]?.plain_text || '',
    billingCity: props['Billing City']?.rich_text?.[0]?.plain_text || '',
    billingState: props['Billing State']?.select?.name || '',
    billingZip: props['Billing ZIp Code']?.rich_text?.[0]?.plain_text || '',
    locationFull: props['Location Address Full']?.rich_text?.[0]?.plain_text || '',
    locStreet1: props['Location Address Line 1']?.rich_text?.[0]?.plain_text || '',
    locStreet2: props['Location Address Line 2']?.rich_text?.[0]?.plain_text || '',
    locCity: props['Location Address City']?.rich_text?.[0]?.plain_text || '',
    locState: props['Location Address State']?.select?.name || '',
    locZip: props['Location Address Zip Code']?.rich_text?.[0]?.plain_text || '',
    services: props['Services Requested']?.multi_select?.map((s: any) => s.name) || [],
    startDate: props['Start Date']?.date?.start || '',
    endDate: props['End Date']?.date?.start || '',
    notes: props['Additional Notes']?.rich_text?.[0]?.plain_text || '',
    price1y: props['Price Per Hour']?.number || 30,
    monthlyHours: Array(12).fill(0),
    schedule,
    notionUrl: page.url
  };
}

export async function searchCustomers(query: string) {
  if (!NOTION_TOKEN) throw new Error('NOTION_TOKEN is missing');
  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: getNotionHeaders(),
    body: JSON.stringify({
      filter: query ? { property: 'Community Name', title: { contains: query } } : undefined,
      sorts: [{ property: 'Community Name', direction: 'ascending' }],
      page_size: 50
    })
  });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.results || []).map(mapNotionToCustomer);
}

export async function saveCustomer(customer: Customer) {
  const properties: any = {
    'Community Name': { title: [{ text: { content: customer.communityName || '' } }] },
    'Overview': { rich_text: [{ text: { content: customer.overview || '' } }] },
    'Customer Type': customer.customerType ? { select: { name: customer.customerType } } : { select: null },
    'Referral Source': customer.referralSource ? { select: { name: customer.referralSource } } : { select: null },
    'Contract Validity': customer.contractValidity ? { select: { name: customer.contractValidity } } : { select: null },
    '# of Locations': { number: Number(customer.numberOfLocations) || 1 },
    'Sub-Location?': { checkbox: !!customer.isSubLocation },
    'Email': { email: customer.email || null },
    'Primary Phone Number': { phone_number: customer.primaryPhone || null },
    'Billing Name': { rich_text: [{ text: { content: customer.billingName || '' } }] },
    'Billing Email': { email: customer.billingEmail || null },
    'Billing Phone Number': { number: customer.billingPhone ? Number(customer.billingPhone) : null },
    'Billing Street': { rich_text: [{ text: { content: customer.billingStreet1 || '' } }] },
    'Billing City': { rich_text: [{ text: { content: customer.billingCity || '' } }] },
    'Billing State': customer.billingState ? { select: { name: customer.billingState } } : { select: null },
    'Billing ZIp Code': { rich_text: [{ text: { content: customer.billingZip || '' } }] },
    'Additional Notes': { rich_text: [{ text: { content: customer.notes || '' } }] },
    'Price Per Hour': { number: Number(customer.price1y) || 30 },
  };

  Object.entries(customer.schedule).forEach(([date, s]) => {
    if (s.hasShift) {
      properties[date] = { rich_text: [{ text: { content: JSON.stringify(s) } }] };
    } else {
      properties[date] = { rich_text: [] };
    }
  });

  const method = customer.id ? 'PATCH' : 'POST';
  const url = customer.id ? `https://api.notion.com/v1/pages/${customer.id}` : `https://api.notion.com/v1/pages`;
  const body: any = { properties };
  if (!customer.id) body.parent = { database_id: DATABASE_ID };

  const response = await fetch(url, { method, headers: getNotionHeaders(), body: JSON.stringify(body) });
  if (!response.ok) throw new Error('Notion save failed');
  const data = await response.json();
  return mapNotionToCustomer(data);
}

export async function createWaveAccount(customer: Customer) {
  if (!ZAPIER_WEBHOOK) return;
  await fetch(ZAPIER_WEBHOOK, { method: 'POST', body: JSON.stringify(customer) });
}