import React from 'react';

export default function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="bg-[#121624] border border-[#1f263e] rounded-xl p-4 flex items-center justify-between gap-3 min-w-0 shadow-lg">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-[#1b2238] border border-[#2d3758] flex items-center justify-center font-bold text-indigo-400 shrink-0">
          {user.name?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate">{user.name} {user.surname}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={() => onEdit(user)}
          className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-950/40 p-1.5 rounded-lg text-sm font-bold transition"
          title="Modifica Utente"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(user)}
          className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-1.5 rounded-lg text-sm font-bold transition"
          title="Elimina Utente"
        >
          ✕
        </button>
      </div>
    </div>
  );
}