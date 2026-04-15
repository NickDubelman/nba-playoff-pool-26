// YYYY-MM-DD (ex: 2024-04-20)
export function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const haventPlayedYet: { name: string; team: string }[] = []

export const teamColors: Record<string, string> = {
  CLE: '#ffc322',
  MIN: '#71b64c',
  UTA: '#2b5134',
  HOU: '#ce1141',
  LAL: '#fec42f',
  DEN: '#0d2240',
  LAC: '#1d428a',
  MIL: '#00471a',
  MIA: '#8b2231',
  DAL: '#0064b1',
  TOR: '#ce1141',
  BOS: '#008348',
  OKC: '#ef5133',
  ORL: '#0077c0',
  PHI: '#006ab6',
  POR: '#e03a3e',
  IND: '#fcb424',
  BRK: '#2d2925',
  GSW: '#04529c',
  WAS: '#c60c31',
  ATL: '#c9082a',
  NYK: '#ed8025',
  PHO: '#e25301',
  SAC: '#5a2d81',
  NOP: '#0c2340',
}
