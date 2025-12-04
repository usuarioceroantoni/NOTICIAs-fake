import { useState, useCallback, useEffect } from 'react';

export interface ProjectData {
    id: string;
    name: string;
    timestamp: number;
    topic: string;
    newsStyle: 'REAL' | 'FAKE';
    newsItems: any[];
    bgMusicUrl: string | null;
    musicConfig: {
        styleId: string;
        moodId: string;
        idea: string;
    };
}

export const useProjectManager = () => {
    const [savedProjects, setSavedProjects] = useState<ProjectData[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    // Load saved projects on mount
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        try {
            const stored = localStorage.getItem('maquina_projects');
            if (stored) {
                const projects = JSON.parse(stored);
                setSavedProjects(projects);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const saveProject = useCallback((projectData: Omit<ProjectData, 'id' | 'timestamp'>) => {
        const newProject: ProjectData = {
            ...projectData,
            id: currentProjectId || Date.now().toString(),
            timestamp: Date.now(),
        };

        try {
            const stored = localStorage.getItem('maquina_projects');
            const projects: ProjectData[] = stored ? JSON.parse(stored) : [];

            const existingIndex = projects.findIndex(p => p.id === newProject.id);
            if (existingIndex >= 0) {
                projects[existingIndex] = newProject;
            } else {
                projects.unshift(newProject);
            }

            // Keep only last 10 projects
            const limitedProjects = projects.slice(0, 10);
            localStorage.setItem('maquina_projects', JSON.stringify(limitedProjects));
            setSavedProjects(limitedProjects);
            setCurrentProjectId(newProject.id);

            return newProject.id;
        } catch (error) {
            console.error('Error saving project:', error);
            return null;
        }
    }, [currentProjectId]);

    const loadProject = useCallback((id: string): ProjectData | null => {
        try {
            const stored = localStorage.getItem('maquina_projects');
            if (stored) {
                const projects: ProjectData[] = JSON.parse(stored);
                const project = projects.find(p => p.id === id);
                if (project) {
                    setCurrentProjectId(id);
                    return project;
                }
            }
        } catch (error) {
            console.error('Error loading project:', error);
        }
        return null;
    }, []);

    const deleteProject = useCallback((id: string) => {
        try {
            const stored = localStorage.getItem('maquina_projects');
            if (stored) {
                const projects: ProjectData[] = JSON.parse(stored);
                const filtered = projects.filter(p => p.id !== id);
                localStorage.setItem('maquina_projects', JSON.stringify(filtered));
                setSavedProjects(filtered);
                if (currentProjectId === id) {
                    setCurrentProjectId(null);
                }
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }, [currentProjectId]);

    const exportProject = useCallback((project: ProjectData) => {
        const dataStr = JSON.stringify(project, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name}_${project.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    const importProject = useCallback((file: File): Promise<ProjectData | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const project = JSON.parse(e.target?.result as string);
                    // Generate new ID to avoid conflicts
                    project.id = Date.now().toString();
                    project.timestamp = Date.now();

                    const stored = localStorage.getItem('maquina_projects');
                    const projects: ProjectData[] = stored ? JSON.parse(stored) : [];
                    projects.unshift(project);
                    localStorage.setItem('maquina_projects', JSON.stringify(projects.slice(0, 10)));
                    setSavedProjects(projects.slice(0, 10));
                    resolve(project);
                } catch (error) {
                    console.error('Error importing project:', error);
                    resolve(null);
                }
            };
            reader.readAsText(file);
        });
    }, []);

    const newProject = useCallback(() => {
        setCurrentProjectId(null);
    }, []);

    return {
        savedProjects,
        currentProjectId,
        autoSaveEnabled,
        setAutoSaveEnabled,
        saveProject,
        loadProject,
        deleteProject,
        exportProject,
        importProject,
        newProject,
        loadProjects,
    };
};
