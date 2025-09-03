import { v4 as uuidv4 } from 'uuid';
import userAvatar from '../assets/useravatar.png';
import { type MessageExtraContent, type MessageProps } from '@patternfly/chatbot';
import botAvatar from '../assets/bot_avatar.jpg';
import { isEmpty } from 'lodash';

export const footnoteProps = {
    label: 'AI can make mistakes. Check important info.',
};


const generateId = () => {
    return uuidv4();
};
export const getUserMessage = (message: string | number) => {
    return {
        id: generateId(),
        role: 'user',
        content: message,
        name: 'User',
        avatar: userAvatar,
        timestamp: new Date().toLocaleString(),
        avatarProps: { isBordered: true },
    } as MessageProps;
};

export const getBotLoadingMessage = () => {
    return {
        id: generateId(),
        role: 'bot',
        content: 'wait we are loading data',
        name: 'Bot',
        avatar: botAvatar,
        isLoading: true,
        timestamp: new Date().toLocaleString(),
    } as MessageProps;
};
export const getBotMessage = (
    message: string | number,
    sources: any[] = [],
    showAction = true,
    quickResponse: any = null,
    extracontent: MessageExtraContent = {}
) => {
    const messageProp = {
        id: generateId(),
        role: 'bot',
        content: message || 'we are not able to answer your query. Please try again',
        name: 'Bot',
        avatar: botAvatar,
        isLoading: false,
        timestamp: new Date().toLocaleString(),
    } as MessageProps;
    if (!isEmpty(extracontent)) {
        messageProp.extraContent = {
            afterMainContent: extracontent.afterMainContent,
            beforeMainContent: extracontent.beforeMainContent,
            endContent: extracontent.endContent,
        };
    }
    if (!isEmpty(sources)) {
        messageProp.sources = {
            sources: sources,
        };
    }
    if (showAction) {
        messageProp.actions = {
            // eslint-disable-next-line no-console
            positive: { onClick: () => console.log('Good response') },
            // eslint-disable-next-line no-console
            negative: { onClick: () => console.log('Bad response') },
            // eslint-disable-next-line no-console
            copy: { onClick: () => console.log('Copy') },
            // eslint-disable-next-line no-console
            share: { onClick: () => console.log('Share') },
            // eslint-disable-next-line no-console
            listen: { onClick: () => console.log('Listen') },
        };
    }
    if (!isEmpty(quickResponse)) {
        messageProp.quickResponses = quickResponse as any;
    }
    return messageProp;
};
