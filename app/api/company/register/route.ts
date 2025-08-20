import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // As per the project requirements, backend changes are out of scope.
    // This endpoint exists to provide a valid submission target for the new
    // company registration form. In a real application, this is where you would
    // save the detailed company information to your database.

    console.log("--- New Company Registration Submission ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("-----------------------------------------");

    // We are not creating a user here, just accepting the data.
    // The user would need to go through the standard sign-up flow
    // separately if that is the desired workflow.

    return NextResponse.json({ success: true, message: 'Company information submitted successfully.' });

  } catch (error) {
    console.error('Company registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to submit company information.', details: errorMessage }, { status: 500 });
  }
}
