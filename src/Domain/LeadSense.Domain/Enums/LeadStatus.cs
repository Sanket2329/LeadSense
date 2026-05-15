using System;
using System.Collections.Generic;
using System.Text;

namespace LeadSense.Domain.Enums;

public enum LeadStatus
{
    New = 1,
    Contacted = 2,
    Qualified = 3,
    ProposalSent = 4,
    Won = 5,
    Lost = 6
}
