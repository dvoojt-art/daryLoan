'use server';
/**
 * @fileOverview A Genkit flow for providing AI-generated loan risk assessment summaries.
 *
 * - assessLoanRisk - A function that handles the loan risk assessment process.
 * - AdminLoanRiskAssessmentInput - The input type for the assessLoanRisk function.
 * - AdminLoanRiskAssessmentOutput - The return type for the assessLoanRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminLoanRiskAssessmentInputSchema = z.object({
  contributionHistory: z
    .array(
      z.object({
        date: z.string().describe('The date of the contribution in YYYY-MM-DD format.'),
        amount: z.number().describe('The amount of the contribution.'),
      })
    )
    .describe('An array of objects detailing the member\'s contribution history.'),
  requestedAmount: z.number().describe('The loan amount requested by the member.'),
  memberId: z.string().describe('The unique identifier for the member.'),
});
export type AdminLoanRiskAssessmentInput = z.infer<
  typeof AdminLoanRiskAssessmentInputSchema
>;

const AdminLoanRiskAssessmentOutputSchema = z.object({
  riskLevel: z
    .enum(['low', 'medium', 'high', 'very high'])
    .describe('The assessed risk level of the loan.'),
  summary: z.string().describe(
    'A detailed summary of the loan risk assessment, including reasons for the risk level and any recommendations.'
  ),
});
export type AdminLoanRiskAssessmentOutput = z.infer<
  typeof AdminLoanRiskAssessmentOutputSchema
>;

export async function assessLoanRisk(
  input: AdminLoanRiskAssessmentInput
): Promise<AdminLoanRiskAssessmentOutput> {
  return adminLoanRiskAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminLoanRiskAssessmentPrompt',
  input: {schema: AdminLoanRiskAssessmentInputSchema},
  output: {schema: AdminLoanRiskAssessmentOutputSchema},
  prompt: `You are an expert financial risk analyst specializing in micro-lending for community-based organizations. Your task is to provide a concise and clear loan risk assessment.

Analyze the provided member contribution history and the requested loan amount to determine the risk level.
Consider factors such as consistency of contributions, total contributions versus requested amount, and any patterns that might indicate financial stability or instability.

Provide a 'riskLevel' (low, medium, high, very high) and a 'summary' explaining your assessment and reasoning.

Member ID: {{{memberId}}}
Contribution History: {{{json contributionHistory}}}
Requested Loan Amount: {{{requestedAmount}}}`,
});

const adminLoanRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'adminLoanRiskAssessmentFlow',
    inputSchema: AdminLoanRiskAssessmentInputSchema,
    outputSchema: AdminLoanRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
