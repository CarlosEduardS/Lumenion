import './itens-layout.css'

interface ContentType {
  isVisible: boolean;
  content: React.ReactNode;
}

export default function ItensLayoutBase( ItensContent : ContentType ){
    return (
        <div className='body-itens-layout' style={{display: ItensContent.isVisible ? undefined : 'none' }}>
            {ItensContent.content}
        </div>
    )
}