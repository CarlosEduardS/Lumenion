import { useState, useRef, useEffect } from 'react';
import './simple-layout.css';

interface LayoutProps {
  HeaderContent: React.ReactNode;
  LeftContent: React.ReactNode;
  RightContent: React.ReactNode;
  MainContent: React.ReactNode;
  FooterContent: React.ReactNode;
}

export default function SimpleLayout({ HeaderContent, LeftContent, RightContent, MainContent, FooterContent }: LayoutProps) {
  // Estados para controlar os tamanhos em pixels
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(200);
  const [footerHeight, setFooterHeight] = useState(100);

  // Refs para monitorar o comportamento do arrasto de forma limpa
  const draggingRef = useRef<'left' | 'right' | 'footer' | null>(null);

  const startResize = (type: 'left' | 'right' | 'footer') => (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = type;
    document.body.style.cursor = type === 'footer' ? 'ns-resize' : 'ew-resize';
    document.body.style.userSelect = 'none'; // Evita selecionar textos enquanto arrasta
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;

      if (draggingRef.current === 'left') {
        // A largura é baseada na posição X do mouse
        const newWidth = Math.max(100, Math.min(400, e.clientX));
        setLeftWidth(newWidth);
      } else if (draggingRef.current === 'right') {
        // A largura é a distância da borda direita da tela até o mouse
        const newWidth = Math.max(100, Math.min(400, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      } else if (draggingRef.current === 'footer') {
        // A altura é a distância do fundo da tela até o mouse
        const newHeight = Math.max(50, Math.min(300, window.innerHeight - e.clientY));
        setFooterHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="background">
      <header>{HeaderContent}</header>
      <div className="layout-body">
        
        {/* Barra Esquerda */}
        <aside 
          className={`left-bar ${
            // Verifica se o LeftContent atual possui a string "active" nas suas classes
            (LeftContent as any)?.props?.className?.includes('active') ? 'active' : ''
          }`} 
          style={
            // Só aplica a largura do puxador se a barra estiver ativa. 
            // Se estiver fechada, deixa o CSS controlar o 0px.
            (LeftContent as any)?.props?.className?.includes('active') 
              ? { width: leftWidth } 
              : {}
          }
        >
          {LeftContent}
        </aside>
        
        {(LeftContent as any)?.props?.className?.includes('active') && (
          <div className="resizer-horizontal" onMouseDown={startResize('left')} />
        )}

        {/* Corpo Central */}
        <div className="main-body">
          <main className="main-window">{MainContent}</main>
          
          {/* Puxador do Footer (Fica no topo do footer) */}
          <div className="resizer-vertical" onMouseDown={startResize('footer')} />
          
          <footer className="resizable-footer" style={{ height: footerHeight }}>
            {FooterContent}
          </footer>
        </div>

        {/* Puxador da Direita */}
        <div className="resizer-horizontal" onMouseDown={startResize('right')} />
        
        {/* Barra Direita */}
        <aside className="right-bar" style={{ width: rightWidth }}>
          {RightContent}
        </aside>

      </div>
    </div>
  );
}