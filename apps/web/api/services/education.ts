import type { VercelRequest, VercelResponse } from '@vercel/node'

interface EducationRequest {
  action: 'universities' | 'programs' | 'scholarships' | 'apply'
  level?: 'bachelor' | 'master' | 'phd' | 'continuing'
  field?: string
  language?: string
}

const universities = [
  {
    id: 1,
    name: 'Universität des Saarlandes',
    type: 'Universität',
    students: 17000,
    programs: 120,
    specialties: ['Informatik', 'Materialwissenschaften', 'Europastudien', 'Medizin'],
    campus: 'Saarbrücken & Homburg',
    international: true,
    ranking: 'Top 300 weltweit',
    website: 'https://www.uni-saarland.de'
  },
  {
    id: 2,
    name: 'htw saar',
    type: 'Hochschule für Technik und Wirtschaft',
    students: 6000,
    programs: 50,
    specialties: ['Ingenieurwesen', 'Wirtschaft', 'Sozialwissenschaften', 'Architektur'],
    campus: 'Saarbrücken',
    international: true,
    ranking: 'Top Applied Sciences University',
    website: 'https://www.htwsaar.de'
  },
  {
    id: 3,
    name: 'HfM Saar',
    type: 'Hochschule für Musik',
    students: 500,
    programs: 20,
    specialties: ['Klassische Musik', 'Jazz', 'Musikpädagogik', 'Komposition'],
    campus: 'Saarbrücken',
    international: true,
    ranking: 'Renommierte Musikhochschule',
    website: 'https://www.hfm.saarland.de'
  }
]

const studyPrograms = [
  {
    id: 1,
    name: 'Informatik (B.Sc.)',
    university: 'Universität des Saarlandes',
    level: 'bachelor',
    duration: '6 Semester',
    language: 'Deutsch/Englisch',
    fields: ['Computer Science', 'AI', 'Cybersecurity'],
    requirements: ['Abitur', 'Mathematik-Kenntnisse'],
    applicationDeadline: '15.07.2024'
  },
  {
    id: 2,
    name: 'Data Science (M.Sc.)',
    university: 'Universität des Saarlandes',
    level: 'master',
    duration: '4 Semester',
    language: 'Englisch',
    fields: ['Data Science', 'Machine Learning', 'Statistics'],
    requirements: ['Bachelor in relevanter Fachrichtung', 'Englisch B2'],
    applicationDeadline: '01.06.2024'
  },
  {
    id: 3,
    name: 'Betriebswirtschaft (B.A.)',
    university: 'htw saar',
    level: 'bachelor',
    duration: '7 Semester',
    language: 'Deutsch',
    fields: ['Management', 'Marketing', 'Finance'],
    requirements: ['Abitur/Fachabitur'],
    applicationDeadline: '15.07.2024'
  }
]

const scholarships = [
  {
    id: 1,
    name: 'Deutschlandstipendium',
    amount: 300,
    currency: 'EUR',
    period: 'Monat',
    duration: 'Mind. 2 Semester',
    requirements: ['Gute Noten', 'Soziales Engagement'],
    provider: 'Bundesregierung',
    applicationDeadline: '30.09.2024'
  },
  {
    id: 2,
    name: 'Saarland-Stipendium',
    amount: 500,
    currency: 'EUR',
    period: 'Monat',
    duration: '12 Monate',
    requirements: ['Exzellente Leistungen', 'Saarland-Bezug'],
    provider: 'Land Saarland',
    applicationDeadline: '31.05.2024'
  },
  {
    id: 3,
    name: 'Aufstiegs-BAföG',
    amount: 892,
    currency: 'EUR',
    period: 'Monat',
    duration: 'Gesamte Weiterbildung',
    requirements: ['Berufliche Weiterbildung', 'Meister/Techniker'],
    provider: 'Bundesregierung',
    applicationDeadline: 'Jederzeit'
  }
]

const continuingEducation = [
  {
    id: 1,
    title: 'Digitale Kompetenzen',
    provider: 'IHK Saarland',
    duration: '3-6 Monate',
    format: 'Hybrid',
    level: 'Alle Level',
    topics: ['Programmierung', 'Data Science', 'Digital Marketing'],
    cost: '2.500€',
    certification: 'IHK-Zertifikat'
  },
  {
    id: 2,
    title: 'Führungskräfte-Training',
    provider: 'Saar-Lor-Lux Academy',
    duration: '12 Monate',
    format: 'Präsenz',
    level: 'Fortgeschritten',
    topics: ['Leadership', 'Change Management', 'Strategie'],
    cost: '8.500€',
    certification: 'Akademie-Diplom'
  }
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { action, level, field, language } = req.query as any

    switch (action) {
      case 'universities':
        return res.status(200).json({
          success: true,
          data: universities,
          total: universities.length,
          totalStudents: universities.reduce((sum, uni) => sum + uni.students, 0),
          totalPrograms: universities.reduce((sum, uni) => sum + uni.programs, 0)
        })

      case 'programs':
        let filteredPrograms = studyPrograms
        
        if (level) {
          filteredPrograms = filteredPrograms.filter(p => p.level === level)
        }
        
        if (field) {
          filteredPrograms = filteredPrograms.filter(p =>
            p.fields.some(f => f.toLowerCase().includes(field.toLowerCase())) ||
            p.name.toLowerCase().includes(field.toLowerCase())
          )
        }
        
        if (language) {
          filteredPrograms = filteredPrograms.filter(p =>
            p.language.toLowerCase().includes(language.toLowerCase())
          )
        }
        
        // Add continuing education if level matches
        if (level === 'continuing') {
          return res.status(200).json({
            success: true,
            data: continuingEducation,
            total: continuingEducation.length,
            type: 'continuing_education'
          })
        }
        
        return res.status(200).json({
          success: true,
          data: filteredPrograms,
          total: filteredPrograms.length,
          filters: { level, field, language }
        })

      case 'scholarships':
        return res.status(200).json({
          success: true,
          data: scholarships,
          total: scholarships.length,
          totalFunding: scholarships.reduce((sum, s) => sum + s.amount, 0)
        })

      case 'apply':
        // Simulate application process
        return res.status(200).json({
          success: true,
          message: 'Bewerbung eingegangen',
          applicationId: `EDU${Date.now()}`,
          status: 'submitted',
          nextSteps: [
            'Prüfung der Zulassungsvoraussetzungen',
            'Bewertung der Unterlagen',
            'Ggf. Aufnahmeprüfung/Interview',
            'Zulassungsbescheid'
          ],
          timeline: '4-8 Wochen'
        })

      default:
        return res.status(200).json({
          success: true,
          service: 'Education Service Saarland',
          availableActions: ['universities', 'programs', 'scholarships', 'apply'],
          statistics: {
            total_students: 24000,
            international_students: '20%',
            employment_rate: '95%',
            average_study_duration: '6.2 Semester'
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Education API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}