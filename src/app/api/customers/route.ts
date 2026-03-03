import { NextRequest, NextResponse } from 'next/server';
import { notionFetch, mapNotionToCustomer } from '@/lib/notion-edge';

export const runtime = 'edge';

const DATABASE_ID = process.env.DATABASE_ID || '289ff85a-fa89-8075-957a-d242fd5acbac';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  try {
    const data = await notionFetch(`/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({
        filter: query ? { property: 'Community Name', title: { contains: query } } : undefined,
        sorts: [{ property: 'Community Name', direction: 'ascending' }],
        page_size: 50
      })
    });

    const results = (data.results || []).map(mapNotionToCustomer);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const customer = await req.json();
    const isUpdate = !!customer.id;
    
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
      'Billing Street 2nd Line': { rich_text: [{ text: { content: customer.billingStreet2 || '' } }] },
      'Billing City': { rich_text: [{ text: { content: customer.billingCity || '' } }] },
      'Billing State': customer.billingState ? { select: { name: customer.billingState } } : { select: null },
      'Billing ZIp Code': { rich_text: [{ text: { content: customer.billingZip || '' } }] },
      'Location Address Full': { rich_text: [{ text: { content: customer.locationFull || '' } }] },
      'Location Address Line 1': { rich_text: [{ text: { content: customer.locStreet1 || '' } }] },
      'Location Address Line 2': { rich_text: [{ text: { content: customer.locStreet2 || '' } }] },
      'Location Address City': { rich_text: [{ text: { content: customer.locCity || '' } }] },
      'Location Address State': customer.locState ? { select: { name: customer.locState } } : { select: null },
      'Location Address Zip Code': { rich_text: [{ text: { content: customer.locZip || '' } }] },
      'Services Requested': { multi_select: (customer.services || []).map((s: string) => ({ name: s })) },
      'Start Date': customer.startDate ? { date: { start: customer.startDate } } : { date: null },
      'End Date': customer.endDate ? { date: { start: customer.endDate } } : { date: null },
      'Additional Notes': { rich_text: [{ text: { content: customer.notes || '' } }] },
      'Price Per Hour': { number: Number(customer.price1y) || 30 },
    };

    if (customer.schedule) {
      Object.entries(customer.schedule).forEach(([date, s]: [string, any]) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          if (s.hasShift) {
            properties[date] = { rich_text: [{ text: { content: JSON.stringify(s) } }] };
          } else {
            properties[date] = { rich_text: [] };
          }
        }
      });
    }

    const endpoint = isUpdate ? `/pages/${customer.id}` : `/pages`;
    const body: any = { properties };
    if (!isUpdate) body.parent = { database_id: DATABASE_ID };

    const data = await notionFetch(endpoint, {
      method: isUpdate ? 'PATCH' : 'POST',
      body: JSON.stringify(body)
    });

    return NextResponse.json(mapNotionToCustomer(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
