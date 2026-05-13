export type ContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export type ContributionWeek = {
  days: ContributionDay[]
}

export type GitHubContributions = {
  totalContributions: number
  weeks: ContributionWeek[]
}

export async function getContributions(year?: number) {
  const suffix = year ? `?year=${year}` : ''

  try {
    const res = await fetch(`/api/github/contributions${suffix}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null
    return (await res.json()) as GitHubContributions | null
  } catch {
    return null
  }
}
