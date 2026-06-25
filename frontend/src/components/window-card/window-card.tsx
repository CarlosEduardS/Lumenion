import './window-card.css'

interface window {
    HTML: React.ReactNode;
}

export default function WindowCard({ HTML } : window)
{
    return (
        <div className="back-window">
            <div className="body">
                {HTML}
            </div>
        </div>
    )
}