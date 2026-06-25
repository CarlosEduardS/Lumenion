import './project-card.css'

interface card {
    HTML: React.ReactNode;
}

export default function ProjectCard({ HTML } : card)
{
    return (
        <>
            <div className="card">
                {HTML}
            </div>
        </>
    )
}