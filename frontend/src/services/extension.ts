interface ExtensionServiceInterface {
    id: number;
    name: string;
    description: string;
    version: string;
}

export default function ExtensionService() {
    var listExtensions: ExtensionServiceInterface[] = [];

    return listExtensions;
}