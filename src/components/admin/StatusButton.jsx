import React from "react";
import { Circle, Loader2, CheckCircle2 } from "lucide-react";

export default function StatusButton({ status, onStatusChange, entity, id }) {
  const getStatusConfig = () => {
    if (entity === 'session' || entity === 'deliverable') {
      return {
        pending: { label: "Sin comenzar", color: "bg-gray-100 text-gray-600 hover:bg-gray-200", icon: Circle },
        inProgress: { label: "En progreso", color: "bg-blue-100 text-blue-600 hover:bg-blue-200", icon: Loader2 },
        done: { label: "Finalizado", color: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200", icon: CheckCircle2 }
      };
    } else if (entity === 'revision') {
      return {
        open: { label: "Sin comenzar", color: "bg-gray-100 text-gray-600 hover:bg-gray-200", icon: Circle },
        inProgress: { label: "En progreso", color: "bg-blue-100 text-blue-600 hover:bg-blue-200", icon: Loader2 },
        fixed: { label: "Finalizado", color: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200", icon: CheckCircle2 }
      };
    }
  };

  const statusConfig = getStatusConfig();
  const normalizedStatus = status?.toLowerCase().replace(/_/g, '');
  
  let currentKey = 'pending';
  if (normalizedStatus === 'inprogress') currentKey = 'inProgress';
  else if (normalizedStatus === 'done' || normalizedStatus === 'fixed' || normalizedStatus === 'completed') currentKey = 'done';
  else if (normalizedStatus === 'open' || normalizedStatus === 'pending') currentKey = 'pending';

  const currentConfig = statusConfig[currentKey] || statusConfig.pending;
  const Icon = currentConfig.icon;

  const handleClick = (e) => {
    e.stopPropagation();
    
    const nextStatus = 
      currentKey === 'pending' ? 'inProgress' : 
      currentKey === 'inProgress' ? 'done' : 
      'pending';
    
    const statusValue = 
      entity === 'session' ? (nextStatus === 'pending' ? 'Pending' : nextStatus === 'inProgress' ? 'Confirmed' : 'Done') :
      entity === 'deliverable' ? (nextStatus === 'pending' ? 'Pending' : nextStatus === 'inProgress' ? 'Sent' : 'Approved') :
      entity === 'revision' ? (nextStatus === 'pending' ? 'Open' : nextStatus === 'inProgress' ? 'InProgress' : 'Fixed') :
      status;

    onStatusChange(id, statusValue);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${currentConfig.color}`}
    >
      <Icon className={`w-3 h-3 ${currentKey === 'inProgress' ? 'animate-spin' : ''}`} />
      {currentConfig.label}
    </button>
  );
}