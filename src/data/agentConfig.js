export const agentKeys = ['watchman', 'paymaster', 'bookkeeper', 'shepherd', 'harvester']

export const agentLabels = {
  watchman:   'Watchman',
  paymaster:  'Paymaster',
  bookkeeper: 'Bookkeeper',
  shepherd:   'Shepherd',
  harvester:  'Harvester',
}

export const agentReplies = {
  watchman:
    "I've flagged a fence line breach on the north pasture — gate 4 was left open overnight. I've logged the time window and cross-referenced foot traffic. Do you want me to pull the full incident report or notify the field crew?",
  paymaster:
    "Supplier invoice #4821 from Ridgeline Supply Co. is 3 days past due. The line item total is $2,840. I can queue it for approval or flag it for dispute if the amounts don't match your PO. How would you like to proceed?",
  bookkeeper:
    "Monthly reconciliation is complete. I found 2 unmatched transactions — one $340 equipment charge and one $95 fuel receipt — that need a category before I can close the period. Want me to walk through them now?",
  shepherd:
    "Health scan flagged 3 animals in pen 7 showing early signs of respiratory distress — elevated breathing rate and reduced feed intake over 48 hours. I'd recommend a vet check within 24 hours. Should I draft the call log?",
  harvester:
    "The forecast window is opening for the east field in about 48 hours — low humidity, no rain through Thursday. Yield projections look strong for the winter wheat block. Want me to draft a crew schedule or check equipment availability first?",
}

export const agentFallbackReplies = {
  watchman:   "Got it. I'll keep monitoring and flag anything else that comes up.",
  paymaster:  "Understood. I'll hold on that and check back with you once it's reviewed.",
  bookkeeper: "Noted. I'll update the ledger and flag it in the period summary.",
  shepherd:   "Thanks. I'll keep watch and alert you if their condition changes.",
  harvester:  "Copy that. I'll keep an eye on the forecast and update the schedule.",
}
