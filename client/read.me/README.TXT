Simple flow
Register → Verify OTP → Create election → Load eligible elections → Cast vote → Update results → Return receipt




Project algorithm :


 This project is a simple e-voting system with three main stages:
______________________________________________________________________

 1.Identity and registration

  The user provides Aadhaar, mobile number, personal details, and   face data.

  The backend validates the inputs, checks for duplicates, sends an OTP, and verifies it.

  If everything is valid, a voter account is created and stored securely.
____________________________________________________________________

2.Election setup
  An admin creates an election with candidates, scope, and time range.

  Elections can be national, state-level, or district-level.

  The system only allows voting when the election is active and the current date is inside the allowed window.
______________________________________________________________________
3.Voting and result recording

The voter logs in and sees only the elections they are eligible for.

Before accepting a vote, the system checks:
   * the election is active,
   * the voter is eligible for that election,
   * the voter has not already voted.
If all checks pass, the vote is recorded, the candidate’s vote count increases, and a receipt hash is generated.