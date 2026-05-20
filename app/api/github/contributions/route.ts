import { NextRequest, NextResponse } from 'next/server'

const levelMap = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME

  if (!token || !username) {
    return NextResponse.json(null, { status: 503 })
  }

  const year = req.nextUrl.searchParams.get('year')
  const variables = {
    username,
    from: year ? `${year}-01-01T00:00:00Z` : undefined,
    to: year ? `${year}-12-31T23:59:59Z` : undefined,
  }

  const query = `query ContributionCalendar($username: String!, $from: DateTime, $to: DateTime) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }`

  let res: Response
  try {
    res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    })
  } catch {
    return NextResponse.json(null, { status: 503 })
  }

  if (!res.ok) return NextResponse.json(null, { status: res.status })

  let json: unknown
  try {
    json = await res.json()
  } catch {
    return NextResponse.json(null, { status: 502 })
  }

  const data = json as {
    data?: { user?: { contributionsCollection?: { contributionCalendar?: unknown } } }
  }
  const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar as
    | {
        totalContributions: number
        weeks: Array<{ contributionDays: Array<Record<string, unknown>> }>
      }
    | undefined
  if (!calendar) return NextResponse.json(null, { status: 404 })

  return NextResponse.json({
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week) => ({
      days: week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel as keyof typeof levelMap] ?? levelMap.NONE,
      })),
    })),
  })
}
