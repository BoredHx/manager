const NOTION_TOKEN = process.env.NOTION_TOKEN;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28'
};

export async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.notion.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  if (!res.ok) throw new Error('Notion API Request Failed');
  return res.json();
}

export function mapNotionToCustomer(page: any) {
  const props = page.properties;
  const schedule: Record<string, any> = {};
  for (const key in props) {
    if (key.length === 10 && key[4] === '-' && key[7] === '-') {
      const textContent = props[key]?.rich_text;
      if (textContent && textContent.length > 0) {
        const plainText = textContent[0]?.plain_text || textContent[0]?.text?.content;
        try {
          const shift = JSON.parse(plainText);
          if (shift.hasShift) schedule[key] = { ...shift, date: key };
        } catch (e) {}
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
    billingCity: props['Billing City']?.rich_text?.[0]?.plain_text || '',
    billingState: props['Billing State']?.select?.name || '',
    billingZip: props['Billing ZIp Code']?.rich_text?.[0]?.plain_text || '',
    locationFull: props['Location Address Full']?.rich_text?.[0]?.plain_text || '',
    locStreet1: props['Location Address Line 1']?.rich_text?.[0]?.plain_text || '',
    locCity: props['Location Address City']?.rich_text?.[0]?.plain_text || '',
    locState: props['Location Address State']?.select?.name || '',
    locZip: props['Location Address Zip Code']?.rich_text?.[0]?.plain_text || '',
    services: props['Services Requested']?.multi_select?.map((s: any) => s.name) || [],
    startDate: props['Start Date']?.date?.start || '',
    endDate: props['End Date']?.date?.start || '',
    notes: props['Additional Notes']?.rich_text?.[0]?.plain_text || '',
    price1y: props['Price Per Hour']?.number || 30,
    schedule
  };
}