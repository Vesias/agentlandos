import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  index: number
}

export function FeatureCard({ title, description, icon: Icon, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-saarland-blue to-innovation-cyan rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-saarland-blue to-innovation-cyan p-0.5 mb-6">
          <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-saarland-blue" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}