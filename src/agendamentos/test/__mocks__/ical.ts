// __mocks__/ical.ts
'use strict';

// __mocks__/ical.ts
interface IcalMock {
    sync: {
        parseFile: jest.Mock;
    };
}

class MockIcal implements IcalMock {
    sync = {
        parseFile: jest.fn().mockImplementation(() => ({
            event1: {
                type: 'VEVENT',
                summary: 'Evento CT - Reunião importante',
                start: new Date('2025-03-01T10:00:00'),
                end: new Date('2025-03-01T11:00:00'),
            },
            event2: {
                type: 'VEVENT',
                summary: 'ST - Atendimento técnico',
                start: new Date('2025-03-02T14:00:00'),
                end: new Date('2025-03-02T15:00:00'),
            },
        })),
    };
}

const mockIcalInstance = new MockIcal();
export default mockIcalInstance;