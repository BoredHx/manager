'use server';
/**
 * @fileOverview An AI assistant that generates phrasing and content suggestions
 * for service agreement sections like 'Overview' and 'Additional Notes',
 * based on customer properties.
 *
 * - generateContractLanguage - A function that handles the contract language generation process.
 * - AiContractLanguageAssistantInput - The input type for the generateContractLanguage function.
 * - AiContractLanguageAssistantOutput - The return type for the generateContractLanguage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiContractLanguageAssistantInputSchema = z.object({
  communityName: z.string().describe('The name of the customer community.').optional(),
  customerType: z.string().optional().describe('The type of customer (e.g., Homeowners Association, Condominium).'),
  numberOfLocations: z.number().optional().describe('The number of locations associated with the customer.'),
  locStreet1: z.string().optional().describe('The street address of the primary service location.'),
  locCity: z.string().optional().describe('The city of the primary service location.'),
  locState: z.string().optional().describe('The state of the primary service location.'),
  locZip: z.string().optional().describe('The zip code of the primary service location.'),
  services: z.array(z.string()).optional().describe('A list of services requested by the customer.').default([]),
  startDate: z.string().optional().describe('The start date of the service contract (YYYY-MM-DD format).'),
  endDate: z.string().optional().describe('The end date of the service contract (YYYY-MM-DD format).'),
  price1y: z.string().optional().describe('The 1-year hourly price for services.'),
  referralSource: z.string().optional().describe('The source from which the customer was referred.'),
  contractValidity: z.string().optional().describe('The validity status of the contract (e.g., Active, Signed, Expired).'),
  currentOverview: z.string().optional().describe('The current text in the Overview section, if any.'),
  currentAdditionalNotes: z.string().optional().describe('The current text in the Additional Notes section, if any.'),
});
export type AiContractLanguageAssistantInput = z.infer<typeof AiContractLanguageAssistantInputSchema>;

const AiContractLanguageAssistantOutputSchema = z.object({
  overviewSuggestions: z.string().describe('Suggested compelling and accurate phrasing for the "Overview" section.'),
  additionalNotesSuggestions: z.string().describe('Suggested detailed content for the "Additional Notes" section.'),
});
export type AiContractLanguageAssistantOutput = z.infer<typeof AiContractLanguageAssistantOutputSchema>;

export async function generateContractLanguage(input: AiContractLanguageAssistantInput): Promise<AiContractLanguageAssistantOutput> {
  return aiContractLanguageAssistantFlow(input);
}

const contractLanguagePrompt = ai.definePrompt({
  name: 'contractLanguagePrompt',
  input: { schema: AiContractLanguageAssistantInputSchema },
  output: { schema: AiContractLanguageAssistantOutputSchema },
  prompt: `You are an expert contract drafting assistant for a pool attendant company. Your task is to generate compelling and accurate phrasing for a service agreement's "Overview" and "Additional Notes" sections. Use the provided customer properties as context. Ensure the language is professional, clear, and highlights the value for the customer.

Customer Details:
- Community Name: {{{communityName}}}
{{#if customerType}}- Customer Type: {{{customerType}}}{{/if}}
{{#if numberOfLocations}}- Number of Locations: {{{numberOfLocations}}}{{/if}}
{{#if locStreet1}}- Primary Location: {{{locStreet1}}}{{#if locCity}}, {{{locCity}}}{{/if}}{{#if locState}}, {{{locState}}}{{/if}}{{#if locZip}}, {{{locZip}}}{{/if}}{{/if}}
{{#if services}}- Services Requested: {{#each services}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if startDate}}- Contract Start Date: {{{startDate}}}{{/if}}
{{#if endDate}}- Contract End Date: {{{endDate}}}{{/if}}
{{#if price1y}}- 1-Year Hourly Rate: \${{{price1y}}}/hr{{/if}}
{{#if referralSource}}- Referral Source: {{{referralSource}}}{{/if}}
{{#if contractValidity}}- Contract Validity Status: {{{contractValidity}}}{{/if}}

{{#if currentOverview}}
Current Overview:
{{{currentOverview}}}
Please provide improved or expanded suggestions for this section, making it more compelling or comprehensive based on the customer details.
{{/if}}

{{#if currentAdditionalNotes}}
Current Additional Notes:
{{{currentAdditionalNotes}}}
Please provide improved or expanded suggestions for this section, adding relevant details based on the customer details.
{{/if}}

Based on these details, generate:
1.  A concise, compelling overview of the services and value proposition for this specific customer.
2.  Any relevant additional notes that might be useful in the contract, considering the customer's specific needs, location, or service requests. If no specific "Additional Notes" are evident, state "No specific additional notes suggested at this time based on provided context."

Provide the output in the specified JSON format with 'overviewSuggestions' and 'additionalNotesSuggestions' fields.`
});

const aiContractLanguageAssistantFlow = ai.defineFlow(
  {
    name: 'aiContractLanguageAssistantFlow',
    inputSchema: AiContractLanguageAssistantInputSchema,
    outputSchema: AiContractLanguageAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await contractLanguagePrompt(input);
    return output!;
  }
);
