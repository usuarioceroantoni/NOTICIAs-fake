import React, { useState } from 'react';
import { ProjectData } from '../hooks/useProjectManager';

interface ProjectManagerProps {
    projects: ProjectData[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onExport: (project: ProjectData) => void;
    onImport: (file: File) => void;
    onNew: () => void;
    currentProjectId: string | null;
    isReal: boolean;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
    projects,
    onLoad,
    onDelete,
    onExport,
    onImport,
    onNew,
    currentProjectId,
    isReal,
}) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
            e.target.value = ''; // Reset input
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const newButtonClass = isReal
        ? 'px-4 py-2 text-xs font-bold rounded-sm bg-emerald-900 text-emerald-100 hover:bg-emerald-800 transition-colors'
        : 'px-4 py-2 text-xs font-bold rounded-sm bg-red-900 text-red-100 hover:bg-red-800 transition-colors';

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-montserrat font-bold text-white">PROYECTOS GUARDADOS</h3>
                <div className="flex gap-2">
                    <button
                        onClick={onNew}
                        className={newButtonClass}
                    >
                        + NUEVO
                    </button>
                    <label className="px-4 py-2 text-xs font-bold rounded-sm bg-blue-900 text-blue-100 hover:bg-blue-800 transition-colors cursor-pointer">
                        IMPORTAR
                        <input
                            type="file"
                            accept="application/json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-mono text-sm border border-gray-800 rounded-sm">
                    No hay proyectos guardados
                </div>
            ) : (
                <div className="space-y-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`p-4 border rounded-sm transition-all ${currentProjectId === project.id
                                ? isReal ? 'border-emerald-600 bg-emerald-950/20' : 'border-red-600 bg-red-950/20'
                                : 'border-gray-800 bg-black/40 hover:border-gray-600'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-white text-sm">{project.name}</h4>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-sm ${project.newsStyle === 'REAL'
                                                ? 'bg-emerald-900 text-emerald-200'
                                                : 'bg-red-900 text-red-200'
                                                }`}
                                        >
                                            {project.newsStyle}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono mb-2">{project.topic}</p>
                                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                                        <span>{formatDate(project.timestamp)}</span>
                                        <span>{project.newsItems.length} escenas</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {currentProjectId !== project.id && (
                                        <button
                                            onClick={() => onLoad(project.id)}
                                            className="px-3 py-1 text-[10px] font-bold rounded-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                        >
                                            CARGAR
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onExport(project)}
                                        className="px-3 py-1 text-[10px] font-bold rounded-sm bg-blue-900 text-blue-200 hover:bg-blue-800 transition-colors"
                                    >
                                        EXPORTAR
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmDelete(project.id)}
                                        className="px-3 py-1 text-[10px] font-bold rounded-sm bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
                                    >
                                        ELIMINAR
                                    </button>
                                </div>
                            </div>

                            {showConfirmDelete === project.id && (
                                <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                                    <span className="text-xs text-yellow-500">¿Seguro que quieres eliminar este proyecto?</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                onDelete(project.id);
                                                setShowConfirmDelete(null);
                                            }}
                                            className="px-3 py-1 text-[10px] font-bold rounded-sm bg-red-900 text-red-100"
                                        >
                                            SÍ, ELIMINAR
                                        </button>
                                        <button
                                            onClick={() => setShowConfirmDelete(null)}
                                            className="px-3 py-1 text-[10px] font-bold rounded-sm bg-gray-800 text-gray-300"
                                        >
                                            CANCELAR
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
