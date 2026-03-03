
export function getNotionToken() {
  return process.env.NOTION_TOKEN;
}

export function getHeaders() {
  return {
    'Authorization': `Bearer ${getNotionToken()}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };
}

export async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const token = getNotionToken();
  if (!token) {
    throw new Error('Missing NOTION_TOKEN in environment variables');
  }

  const url = `https://api.notion.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers }
  });
  
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Notion API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Optimized mapping function.
 * If 'parseSchedule' is false, it skips the heavy iteration over date columns.
 * This prevents 504 timeouts during search.
 */
export function mapNotionToCustomer(page: any, parseSchedule: boolean = false) {
  const props = page.properties;
  const schedule: Record<string, any> = {};
  
  if (parseSchedule) {
    const keys = Object.keys(props);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // Only check keys that look like YYYY-MM-DD
      if (key.length === 10 && key[4] === '-' && key[7] === '-') {
        const prop = props[key];
        if (prop.type === 'rich_text' && prop.rich_text?.length > 0) {
          const text = prop.rich_text[0].plain_text || prop.rich_text[0].text?.content;
          if (text && text.startsWith('{')) {
            try {
              const shift = JSON.parse(text);
              if (shift.hasShift) schedule[key] = { ...shift, date: key };
            } catch (e) {}
          }
        }
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
