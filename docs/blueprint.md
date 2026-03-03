# **App Name**: AttendantDesk

## Core Features:

- Secure Notion Data Access: Establish a secure connection to Notion Database via Firebase Cloud Functions acting as a proxy, ensuring the Notion API Integration Token is never exposed on the client-side for all read and write operations, adhering to the specified property mapping.
- Customer Data Management Dashboard: A user interface providing capabilities to search existing customers, add new customer records, and edit all customer details including location, billing, and contact information, ensuring exact mapping to Notion properties.
- Dynamic Pricing Calculator: Implement a real-time slider and input field for a base hourly rate, dynamically calculating and displaying the 1-year, 2-year (2% discount), and 3-year (4% discount) contract rates for quick financial overview.
- Integrated Schedule Calendar & Shift Management: Display a custom monthly grid calendar for the 2026 season (May-September). Allow users to click on individual days to open a modal for setting start time, end time, and staff count, saving shifts as JSON strings in Notion rich text properties.
- Weekly Schedule Template Tool: Provide a modal interface to define a recurring weekly shift template and apply it to a specified date range, overwriting existing shifts within that period for efficient schedule planning.
- Printable Service Agreement Generator: Generate a detailed, multi-section HTML document formatted for browser-based PDF printing, dynamically populated with customer-specific data, calculated pricing, and scheduled shift summaries (including various calendar and list appendices).
- Wave Accounting Integration Trigger: Include a 'Create Wave Account' button that sends a POST request with the customer's billing and shipping information to the specified Zapier Webhook, facilitating new account creation in Wave Accounting.
- AI Contract Language Assistant Tool: Leverage a generative AI tool to assist in drafting and refining sections of the service agreement, such as the 'Overview' or 'Additional Notes', by providing intelligent suggestions for contract phrasing and content based on other selected customer properties.

## Style Guidelines:

- Primary color: A sophisticated, professional blue (#246B94) to evoke trust and clarity, selected to integrate smoothly with a light-themed interface. (HSL: 205, 60%, 35%)
- Background color: A very light, subtle blue-gray (#ECF3F6) providing a clean, airy canvas. (HSL: 205, 15%, 95%)
- Accent color: A fresh, vibrant aqua (#4CE0D4) for interactive elements and highlights, offering a natural complement to the primary blue. (HSL: 175, 70%, 50%)
- Body and headline font: 'Inter' (sans-serif) for its modern, highly readable, and professional appearance across all text elements.
- Utilize Lucide React icons, chosen for their clean, outline style and extensive library, ensuring consistency and clear visual communication throughout the application.
- Employ a responsive three-column dashboard layout (sidebar, main content, calendar/secondary panel) designed to adapt seamlessly to various screen sizes, from desktop to mobile.
- Incorporate subtle and smooth transitions for UI state changes, modal presentations, and data loading indicators to enhance the user experience without distraction.