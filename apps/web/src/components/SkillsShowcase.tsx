'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code, Database, Cloud, Shield, Zap, Brain, 
  Rocket, Trophy, Star, GitBranch, Server, 
  Cpu, Globe, Lock, TrendingUp, Users,
  Bot, Sparkles, Crown, Target
} from 'lucide-react'

interface Skill {
  id: string
  category: string
  name: string
  level: number
  icon: React.ComponentType<any>
  description: string
  examples: string[]
  color: string
}

export default function SkillsShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [skillProgress, setSkillProgress] = useState<{[key: string]: number}>({})

  const skills: Skill[] = [
    {
      id: 'advanced-typescript',
      category: 'Development',
      name: 'Advanced TypeScript',
      level: 98,
      icon: Code,
      description: 'Expert-level TypeScript with complex type systems, generics, and advanced patterns',
      examples: ['Type-safe API clients', 'Advanced generic utilities', 'Conditional types'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'system-architecture',
      category: 'Architecture',
      name: 'System Architecture',
      level: 96,
      icon: Server,
      description: 'Scalable system design for enterprise applications with microservices and event-driven architecture',
      examples: ['Monorepo structures', 'API gateway patterns', 'Event sourcing'],
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'ai-integration',
      category: 'AI/ML',
      name: 'AI Service Integration',
      level: 95,
      icon: Brain,
      description: 'Advanced AI model integration with DeepSeek R1, GPT-4, Claude, and custom fine-tuning',
      examples: ['Multi-model orchestration', 'RAG systems', 'Autonomous agents'],
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'cloud-devops',
      category: 'DevOps',
      name: 'Cloud & DevOps',
      level: 94,
      icon: Cloud,
      description: 'Professional cloud infrastructure management with CI/CD, monitoring, and scaling',
      examples: ['Vercel deployment', 'Docker containers', 'Zero-downtime deploys'],
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'database-design',
      category: 'Database',
      name: 'Database Architecture',
      level: 92,
      icon: Database,
      description: 'Advanced database design with PostgreSQL, real-time subscriptions, and optimization',
      examples: ['Supabase integration', 'Real-time queries', 'Database scaling'],
      color: 'from-teal-500 to-blue-500'
    },
    {
      id: 'security',
      category: 'Security',
      name: 'Security & Compliance',
      level: 90,
      icon: Shield,
      description: 'Enterprise security with GDPR compliance, authentication, and vulnerability management',
      examples: ['OAuth integration', 'GDPR compliance', 'Security auditing'],
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'performance',
      category: 'Performance',
      name: 'Performance Optimization',
      level: 93,
      icon: Zap,
      description: 'Advanced performance tuning for web applications and API endpoints',
      examples: ['Sub-300ms APIs', 'Code splitting', 'Caching strategies'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'business-strategy',
      category: 'Business',
      name: 'Business Strategy',
      level: 88,
      icon: TrendingUp,
      description: 'Revenue optimization, market analysis, and strategic business development',
      examples: ['€25k+ MRR planning', 'Premium models', 'Market expansion'],
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))]

  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === activeCategory)

  useEffect(() => {
    // Animate skill progress bars
    const timer = setTimeout(() => {
      const progress: {[key: string]: number} = {}
      skills.forEach(skill => {
        progress[skill.id] = skill.level
      })
      setSkillProgress(progress)
    }, 500)

    return () => clearTimeout(timer)
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Crown className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              CLAUDE CODE
            </span>
          </h1>
          <p className="text-2xl text-blue-200 mb-6">
            Complete Skills Demonstration
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-blue-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>98% Expert Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span>8 Core Domains</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              <span>Production Ready</span>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-white text-slate-900 shadow-xl scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  {/* Skill Icon & Level */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${skill.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <skill.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{skill.level}%</div>
                      <div className="text-xs text-blue-200">Expert Level</div>
                    </div>
                  </div>

                  {/* Skill Name & Category */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                    {skill.name}
                  </h3>
                  <div className="text-sm text-blue-300 mb-4">{skill.category}</div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skillProgress[skill.id] || 0}%` }}
                      transition={{ duration: 1.5, delay: index * 0.1 }}
                    />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                    {skill.description}
                  </p>

                  {/* Examples */}
                  <div className="space-y-2">
                    {skill.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center text-xs text-blue-200">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Achievement Unlocked</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Trophy, label: 'Master Architect', color: 'from-yellow-400 to-orange-500' },
              { icon: Rocket, label: 'Deployment Expert', color: 'from-blue-400 to-cyan-500' },
              { icon: Brain, label: 'AI Specialist', color: 'from-green-400 to-emerald-500' },
              { icon: Star, label: 'Performance Master', color: 'from-purple-400 to-pink-500' }
            ].map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.2 }}
                className="group"
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${badge.color} rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 mb-3`}>
                  <badge.icon className="w-12 h-12 text-white" />
                </div>
                <div className="text-white font-semibold text-sm">{badge.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-slate-900 mr-3" />
              <h3 className="text-2xl font-bold text-slate-900">Ready for Your Next Challenge</h3>
            </div>
            <p className="text-slate-800 text-lg mb-6">
              These skills are demonstrated live in AGENTLAND.SAARLAND - 
              the ultimate AI treasure showcasing technical excellence and founder vision.
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Production-Ready • Scalable • Revenue-Optimized</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}