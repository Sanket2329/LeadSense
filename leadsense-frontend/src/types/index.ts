// ─── Enums as const objects (erasableSyntaxOnly compatible) ─────────────────

export const LeadStatus = {
  New: 1,
  Contacted: 2,
  Qualified: 3,
  ProposalSent: 4,
  Won: 5,
  Lost: 6,
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const LeadSource = {
  Website: 1,
  Referral: 2,
  SocialMedia: 3,
  EmailCampaign: 4,
  ColdCall: 5,
  Advertisement: 6,
  Other: 7,
} as const;
export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export const ActivityType = {
  Call: 1,
  Email: 2,
  Meeting: 3,
  Demo: 4,
  WhatsApp: 5,
  Note: 6,
  FollowUp: 7,
  ProposalSent: 8,
  StatusChange: 9,
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const ActivityStatus = {
  Pending: 1,
  Completed: 2,
  Cancelled: 3,
} as const;
export type ActivityStatus = (typeof ActivityStatus)[keyof typeof ActivityStatus];

// ─── Label Maps ─────────────────────────────────────────────────────────────

export const LeadStatusLabels: Record<LeadStatus, string> = {
  [LeadStatus.New]: 'New',
  [LeadStatus.Contacted]: 'Contacted',
  [LeadStatus.Qualified]: 'Qualified',
  [LeadStatus.ProposalSent]: 'Proposal Sent',
  [LeadStatus.Won]: 'Won',
  [LeadStatus.Lost]: 'Lost',
};

export const LeadSourceLabels: Record<LeadSource, string> = {
  [LeadSource.Website]: 'Website',
  [LeadSource.Referral]: 'Referral',
  [LeadSource.SocialMedia]: 'Social Media',
  [LeadSource.EmailCampaign]: 'Email Campaign',
  [LeadSource.ColdCall]: 'Cold Call',
  [LeadSource.Advertisement]: 'Advertisement',
  [LeadSource.Other]: 'Other',
};

export const ActivityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.Call]: 'Call',
  [ActivityType.Email]: 'Email',
  [ActivityType.Meeting]: 'Meeting',
  [ActivityType.Demo]: 'Demo',
  [ActivityType.WhatsApp]: 'WhatsApp',
  [ActivityType.Note]: 'Note',
  [ActivityType.FollowUp]: 'Follow Up',
  [ActivityType.ProposalSent]: 'Proposal Sent',
  [ActivityType.StatusChange]: 'Status Change',
};

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.Pending]: 'Pending',
  [ActivityStatus.Completed]: 'Completed',
  [ActivityStatus.Cancelled]: 'Cancelled',
};

// ─── API Response Types ──────────────────────────────────────────────────────

export interface LeadResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: LeadStatus;
  source: LeadSource;
  assignedToUserId: string | null;
}

export interface CreateLeadResponse {
  id: string;
}

export interface LeadActivityResponse {
  id: string;
  type: ActivityType;
  notes: string;
  status: ActivityStatus;
  scheduledFor: string | null;
  completedOn: string | null;
}

export interface LeadActivityDetailResponse {
  id: string;
  type: ActivityType;
  notes: string;
  status: ActivityStatus;
  scheduledFor: string | null;
}

export interface OverdueActivityResponse {
  id: string;
  type: ActivityType;
  notes: string;
  scheduledFor: string | null;
}

export interface ActivityStatsResponse {
  pending: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export interface ApiError {
  code: string;
  message: string;
}

// ─── Request / Command Types ─────────────────────────────────────────────────

export interface CreateLeadCommand {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  source: LeadSource;
  companyName?: string;
  notes?: string;
}

export interface UpdateLeadCommand {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateLeadStatusCommand {
  status: LeadStatus;
}

export interface CreateLeadActivityCommand {
  type: ActivityType;
  notes: string;
  scheduledFor?: string;
}

export interface RescheduleLeadActivityRequest {
  scheduledFor: string;
}

export interface UpdateLeadActivityNotesRequest {
  notes: string;
}
