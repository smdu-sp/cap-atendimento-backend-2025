// __mocks__/fs.ts
import * as path from 'path';
import * as fs from 'fs';

class MockFs {
    private mockFiles: { [key: string]: string[] } = {};

    __setMockFiles(newMockFiles: { [key: string]: string }) {
        this.mockFiles = {};
        Object.keys(newMockFiles).forEach(file => {
            const dir = path.dirname(file);
            if (!this.mockFiles[dir]) {
                this.mockFiles[dir] = [];
            }
            this.mockFiles[dir].push(path.basename(file));
        });
    }

    readdirSync(directoryPath: string) {
        return this.mockFiles[directoryPath] || [];
    }

    // Implementação das funções padrão do fs
    readFileSync = fs.readFileSync;
    writeFileSync = fs.writeFileSync;
    // Adicione outras funções do fs conforme necessário
}

const mockFsInstance = new MockFs();
(fs as any).__setMockFiles = mockFsInstance.__setMockFiles.bind(mockFsInstance);
(fs as any).readdirSync = mockFsInstance.readdirSync.bind(mockFsInstance);

export default fs as typeof fs & MockFs;