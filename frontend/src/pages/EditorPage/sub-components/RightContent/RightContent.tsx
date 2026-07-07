import './RightContent.css'
import { useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import { type StoredProject } from '../../../../services/project-store';
import { useBridge, type ProjectTreeNode } from '../../../../hooks/useBridge';
import ProjectTree from './ProjectTree';

type Props = {
    project: StoredProject;
};

export default function RightContent({ project }: Props) {
    const { LerArvoreDoProjeto } = useBridge();
    const [tree, setTree] = useState<ProjectTreeNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // 📥 Recarrega a árvore sempre que o projeto (ou sua pasta) mudar.
    // Projetos importados antes dessa feature existir não têm folderPath —
    // tratamos isso como um caso esperado, não um erro.
    useEffect(() => {
        let cancelado = false;

        async function carregarArvore() {
            if (!project.folderPath) {
                setErro('Esse projeto não tem uma pasta associada (foi importado de um .light antigo).');
                setTree(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setErro(null);

            try {
                const resultado = await LerArvoreDoProjeto(project.folderPath);
                if (cancelado) return;

                if (!resultado) {
                    setErro('A pasta do projeto não foi encontrada no disco. Ela pode ter sido movida ou apagada.');
                    setTree(null);
                } else {
                    setTree(resultado);
                }
            } catch (error) {
                if (!cancelado) {
                    console.error('Erro ao ler a árvore do projeto:', error);
                    setErro('Não foi possível ler a pasta do projeto — veja o console para detalhes.');
                }
            } finally {
                if (!cancelado) setLoading(false);
            }
        }

        carregarArvore();
        return () => { cancelado = true; };
    }, [project.folderPath]);

    return (
        <div className="right-main">
            <div className="right-main-header">
                <FaIcons.FaFolder size={15} />
                <h5>Arquivos do Projeto</h5>
            </div>

            {loading && <p className="right-main-status">Carregando árvore de arquivos...</p>}
            {!loading && erro && <p className="right-main-status right-main-error">{erro}</p>}
            {!loading && !erro && tree && (
                <div className="project-tree">
                    <ProjectTree node={tree} defaultOpen />
                </div>
            )}
        </div>
    );
}