interface PreparedStatement {
  bind: (...args: unknown[]) => PreparedStatement
  all<T>(): Promise<{ results?: T[] }>
  first<T>(): Promise<T | undefined>
  run(): Promise<unknown>
}

export interface DatabaseContext {
  DB: {
    prepare: (query: string) => PreparedStatement
  }
}

export type RawRequestRow = Record<string, string | number | null>

export interface EnrichedSubmission {
  id: string
  file_url: string
  nickname: string
  score: number
  user_id: string
  is_approved: boolean
}

export interface EnrichedRequest {
  id: string
  prompt: string
  type: string
  style: string
  offered_credits: number
  extra_reward_credits: number
  status: string
  created_at: string
  nickname: string
  request_category: string
  voting_mode: string
  deadline: string | null
  accepted_user_id: string | null
  submissions: EnrichedSubmission[]
  participants: Array<{ user_id: string; nickname: string }>
  total_votes: number
  voting_state: string
  user_vote_submission_id: string | null
}

function computeVotingState(row: {
  status: string
  requestCategory: string
  votingMode: string
  deadline: string | null
}) {
  if (row.status === 'fulfilled') return 'lezárva'
  if (row.requestCategory !== 'challenge') {
    if (row.status === 'accepted') return 'folyamatban'
    return 'nyitott'
  }
  const now = Date.now()
  const deadlineTs = row.deadline ? new Date(row.deadline).getTime() : null
  if (deadlineTs && deadlineTs < now) {
    return row.votingMode === 'community' ? 'közösségi szavazás' : 'zsűrizés alatt'
  }
  return 'nevezés nyitva'
}

export async function enrichRequestRow({
  env,
  row,
  currentVote,
}: {
  env: DatabaseContext
  row: RawRequestRow
  currentVote: string | null
}): Promise<EnrichedRequest> {
  const deadlineValue = row.deadline ? new Date(String(row.deadline)).toISOString() : null
  const base = {
    id: String(row.id),
    prompt: String(row.prompt),
    type: String(row.type),
    style: String(row.style),
    offered_credits: Number(row.offered_credits ?? 0),
    extra_reward_credits: row.extra_reward_credits != null ? Number(row.extra_reward_credits) : 0,
    status: String(row.status),
    created_at: String(row.created_at),
    nickname: String(row.nickname),
    request_category: String(row.request_category),
    voting_mode: String(row.voting_mode),
    deadline: deadlineValue,
    accepted_user_id: row.accepted_user_id ? String(row.accepted_user_id) : null,
  }

  let submissions: EnrichedSubmission[] = []
  let participants: Array<{ user_id: string; nickname: string }> = []
  let total_votes = 0
  if (base.request_category === 'challenge') {
    const submissionsRows = await env.DB.prepare(
      `SELECT rs.id, rs.file_url, rs.user_id, rs.is_approved,
              u.nickname,
              COALESCE((SELECT SUM(score) FROM request_votes WHERE submission_id = rs.id), 0) as score
       FROM request_submissions rs
       JOIN user u ON u.id = rs.user_id
       WHERE rs.request_id = ?1`
    )
      .bind(base.id)
      .all<Record<string, string | number>>()
    submissions = (submissionsRows.results || []).map((s) => {
      const score = Number(s.score ?? 0)
      total_votes += score
      return {
        id: String(s.id),
        file_url: String(s.file_url),
        nickname: String(s.nickname ?? 'ismeretlen'),
        score,
        user_id: String(s.user_id),
        is_approved: Number(s.is_approved ?? 0) === 1,
      }
    })
    submissions.sort((a, b) => {
      if (b.score === a.score) return a.nickname.localeCompare(b.nickname)
      return b.score - a.score
    })
    const seen = new Set<string>()
    participants = submissions.reduce<Array<{ user_id: string; nickname: string }>>((acc, submission) => {
      if (!seen.has(submission.user_id)) {
        seen.add(submission.user_id)
        acc.push({ user_id: submission.user_id, nickname: submission.nickname })
      }
      return acc
    }, [])
  }

  const voting_state = computeVotingState({
    status: base.status,
    requestCategory: base.request_category,
    votingMode: base.voting_mode,
    deadline: base.deadline,
  })

  return {
    ...base,
    submissions,
    participants,
    total_votes,
    voting_state,
    user_vote_submission_id: currentVote,
  }
}
