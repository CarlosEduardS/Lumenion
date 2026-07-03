interface ExtensionServiceInterface {
    id: number;
    icon: string;
    name: string;
    description: string;
    version: string;
}

export default function ExtensionService() {
    var listExtensions: ExtensionServiceInterface[] = [
        {
            id: 1,
            icon: "/assets/pngs/image-static.png",
            name: "Example Extension",
            description: "An example extension for demonstration purposes.",
            version: "1.0.0"
        },
        {
            id: 2,
            icon: "/assets/pngs/image-static.png",
            name: "Another Extension",
            description: "Another example extension for demonstration purposes.",
            version: "1.0.0"
        }
    ];

    return listExtensions;
}