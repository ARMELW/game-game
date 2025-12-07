import type { MessageRegistry } from "../../core/types/bridge-messages.types";

export const MESSAGE_REGISTRY: MessageRegistry = {
    'SetValue': {
        type: 'SetValue',
        direction: 'toUnity',
    },

    'ChangeList': {
        type: 'ChangeList',
        direction: 'toUnity',
    },
    'LockThousand': {
        type: 'LockThousand',
        direction: 'toUnity',
    },
    'LockHundred': {
        type: 'LockHundred',
        direction: 'toUnity',
    },
    'LockTen': {
        type: 'LockTen',
        direction: 'toUnity',
    },
    'LockUnit': {
        type: 'LockUnit',
        direction: 'toUnity'
    }
};