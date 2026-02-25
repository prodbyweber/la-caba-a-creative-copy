import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const demographicsData = [
  { age: "13-17", percentage: 12 },
  { age: "18-24", percentage: 38 },
  { age: "25-34", percentage: 28 },
  { age: "35-44", percentage: 15 },
  { age: "45+", percentage: 7 },
];

const genderData = [
  { gender: "Femenino", percentage: 58 },
  { gender: "Masculino", percentage: 40 },
  { gender: "Otro", percentage: 2 },
];

export default function DemographicsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-1 bg-[#111113] rounded-lg border border-white/5 p-2"
    >
      <h3 className="text-[10px] font-bold mb-2">Demografía</h3>

      {/* Age Demographics */}
      <div className="mb-2">
        <h4 className="text-[8px] font-semibold text-gray-400 mb-1">Edad</h4>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demographicsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis 
                dataKey="age" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 6 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 6 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1d', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '8px'
                }}
              />
              <Bar dataKey="percentage" fill="#a855f7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Demographics */}
      <div>
        <h4 className="text-[8px] font-semibold text-gray-400 mb-1.5">Sexo</h4>
        <div className="space-y-1">
          {genderData.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[7px] text-gray-300 w-10 truncate">{item.gender}</span>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-[7px] font-semibold text-gray-300 w-5 text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}