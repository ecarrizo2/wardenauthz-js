import { z } from 'zod'

export interface TeamMemberItem {
  subjectId: string
  scopeId: string
  roleIds: string[]
  email?: string
  name?: string
  invitedBy: string
  createdAt: string
  status: 'pending' | 'active'
}

export const TeamMemberItemSchema = z.object({
  subjectId: z.string(),
  scopeId: z.string(),
  roleIds: z.array(z.string()),
  email: z.string().optional(),
  name: z.string().optional(),
  invitedBy: z.string(),
  createdAt: z.string(),
  status: z.enum(['pending', 'active']),
})

export interface AddTeamMemberInput {
  subjectId?: string
  roleIds: string[]
  email?: string
  name?: string
}

export const AddTeamMemberInputSchema = z.object({
  subjectId: z.string().max(256).optional(),
  roleIds: z.array(z.string().min(1).max(100)).max(50),
  email: z.string().email().max(254).optional(),
  name: z.string().max(256).optional(),
})
