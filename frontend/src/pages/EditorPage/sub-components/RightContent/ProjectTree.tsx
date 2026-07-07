import { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import { type ProjectTreeNode } from '../../../../hooks/useBridge';

type Props = {
    node: ProjectTreeNode;
    depth?: number;
    defaultOpen?: boolean;
};

function iconForFile(name: string) {
    if (name.endsWith('.cs') || name.endsWith('.lum')) return <FaIcons.FaFileCode size={13} />;
    if (name.endsWith('.light')) return <FaIcons.FaFileArchive size={13} />;
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(name)) return <FaIcons.FaFileImage size={13} />;
    if (/\.(mp3|wav|ogg)$/i.test(name)) return <FaIcons.FaFileAudio size={13} />;
    return <FaIcons.FaFile size={13} />;
}

/**
 * Nó recursivo da árvore de arquivos do projeto. A raiz vem sempre aberta
 * (defaultOpen no RightContent), e cada subpasta nasce fechada — clicar
 * alterna, igual um explorador de arquivos comum.
 */
export default function ProjectTree({ node, depth = 0, defaultOpen = false }: Props) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (!node.isDirectory) {
        return (
            <div className="tree-item tree-file" style={{ paddingLeft: `${depth * 14}px` }}>
                {iconForFile(node.name)}
                <span>{node.name}</span>
            </div>
        );
    }

    return (
        <div className="tree-branch">
            <div
                className="tree-item tree-folder"
                style={{ paddingLeft: `${depth * 14}px` }}
                onClick={() => setIsOpen((v) => !v)}
            >
                {isOpen ? <FaIcons.FaFolderOpen size={13} /> : <FaIcons.FaFolder size={13} />}
                <span>{node.name}</span>
            </div>
            {isOpen && node.children.map((child) => (
                <ProjectTree key={child.name} node={child} depth={depth + 1} />
            ))}
        </div>
    );
}