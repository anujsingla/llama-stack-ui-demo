import { Fragment, useEffect, useRef, useState } from "react";

import Chatbot, {
  ChatbotDisplayMode,
} from "@patternfly/chatbot/dist/dynamic/Chatbot";
import ChatbotContent from "@patternfly/chatbot/dist/dynamic/ChatbotContent";
import ChatbotWelcomePrompt, {
  type WelcomePrompt,
} from "@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt";
import ChatbotFooter, {
  ChatbotFootnote,
} from "@patternfly/chatbot/dist/dynamic/ChatbotFooter";
import MessageBar from "@patternfly/chatbot/dist/dynamic/MessageBar";
import MessageBox from "@patternfly/chatbot/dist/dynamic/MessageBox";
import Message, {
  type MessageProps,
} from "@patternfly/chatbot/dist/dynamic/Message";
import ChatbotConversationHistoryNav, {
  type Conversation,
} from "@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav";
import ChatbotHeader, {
  ChatbotHeaderMenu,
  ChatbotHeaderMain,
} from "@patternfly/chatbot/dist/dynamic/ChatbotHeader";
import { useNavigate, useParams } from "react-router-dom";
import { isEmpty, trim } from "lodash";
import {
  footnoteProps,
  getBotLoadingMessage,
  getBotMessage,
  getUserMessage,
} from "../utils/appUtils";
import { fetchAIData, type IAIResponse } from "../apis/api";

export const ChatbotComponent = () => {
  const displayMode = ChatbotDisplayMode.fullscreen;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState<
    Conversation[] | { [key: string]: Conversation[] }
  >({});
  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const { sessionId } = useParams<{ sessionId?: string }>();

  useEffect(() => {
    // don't scroll the first load - in this demo, we know we start with two messages
    if (messages.length > 2) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const headerComponent = (
    <ChatbotHeader>
      <ChatbotHeaderMain>
        <ChatbotHeaderMenu
          ref={historyRef}
          aria-expanded={isDrawerOpen}
          onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        />
      </ChatbotHeaderMain>
    </ChatbotHeader>
  );

  const onSelectHistoryItem = async (sessionId: string | undefined) => {
    if (isEmpty(sessionId)) {
      return;
    }
    navigate(`/chat/${sessionId}`);
  };

  const findMatchingItems = (targetValue: string) => {
    let filteredConversations = Object.entries(conversations).reduce(
      (acc, [key, items]) => {
        const filteredItems = (items as any).filter((item: any) =>
          item.text.toLowerCase().includes(targetValue.toLowerCase())
        );
        if (filteredItems.length > 0) {
          acc[key] = filteredItems;
        }
        return acc;
      },
      {} as any
    );

    // append message if no items are found
    if (Object.keys(filteredConversations).length === 0) {
      filteredConversations = [
        { id: "13", noIcon: true, text: "No results found" },
      ];
    }
    return filteredConversations;
  };

  const handleSend = async (message: string | number) => {
    console.log("handleSend");
    if (isEmpty(message)) {
      return;
    }
    console.log("handlesend", messages);
    const newMessages: MessageProps[] = [];
    messages.forEach((message) => newMessages.push(message));
    // It's important to set a timestamp prop since the Message components re-render.
    // The timestamps re-render with them.
    newMessages.push(getUserMessage(message));
    newMessages.push(getBotLoadingMessage());
    setMessages(newMessages);
    // make announcement to assistive devices that new messages have been added
    const loadedMessages: MessageProps[] = [];
    newMessages.forEach((message) => loadedMessages.push(message));
    loadedMessages.pop();
    let response: IAIResponse | null = null;
    try {
      response = await fetchAIData({
        message: trim(message as string),
        session_id: sessionId || undefined,
      });
    } catch {
      console.log("backend error", response?.error);
    } finally {
      console.log("api response", response, response?.response);

      loadedMessages.push(
        getBotMessage(response?.response as string, undefined, true, null)
      );

      if (response?.session_id && isEmpty(sessionId)) {
        navigate(`/chat/${response?.session_id}`);
      }
      setMessages(loadedMessages);
    }
  };

  const welcomePrompts: WelcomePrompt[] = [
    {
      title: "GitHub Repository details",
      onClick: () => {
        handleSend(
          "Details of the GitHub Repository llamastack/llama-stack-client-python"
        );
      },
      message:
        "Details of the GitHub Repository llamastack/llama-stack-client-python",
    },
    {
      title: "GitHub Repository details",
      onClick: () => {
        handleSend("Details of the GitHub Repository llamastack/llama-stack");
      },
      message: "Details of the GitHub Repository llamastack/llama-stack",
    },
  ];

  return (
    <Chatbot displayMode={displayMode}>
      <ChatbotConversationHistoryNav
        displayMode={displayMode}
        onDrawerToggle={() => {
          setIsDrawerOpen(!isDrawerOpen);
        }}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        activeItemId={sessionId}
        onSelectActiveItem={(_, selectedItem) =>
          onSelectHistoryItem(selectedItem as any)
        }
        conversations={conversations}
        onNewChat={() => {
          setIsDrawerOpen(!isDrawerOpen);
          setMessages([]);
          navigate("/chat");
        }}
        handleTextInputChange={(value: string) => {
          if (value === "") {
            // setConversations(initialConversations);
          }
          // this is where you would perform search on the items in the drawer
          // and update the state
          const newConversations: { [key: string]: Conversation[] } =
            findMatchingItems(value);
          setConversations(newConversations);
        }}
        drawerContent={
          <>
            {headerComponent}
            <ChatbotContent>
              <MessageBox>
                <ChatbotWelcomePrompt
                  title="Hello, Anuj"
                  description="How may I help you today?"
                  prompts={welcomePrompts}
                />
                {messages.map((message, index) => {
                  if (index === messages.length - 1) {
                    return (
                      <Fragment key={message.id}>
                        <div ref={scrollToBottomRef}></div>
                        <Message key={message.id} {...message} />
                      </Fragment>
                    );
                  }
                  return <Message key={message.id} {...message} />;
                })}
              </MessageBox>
            </ChatbotContent>
            <ChatbotFooter>
              <MessageBar
                alwayShowSendButton
                hasAttachButton={false}
                onSendMessage={handleSend}
              />

              <ChatbotFootnote {...footnoteProps} />
            </ChatbotFooter>
          </>
        }
      ></ChatbotConversationHistoryNav>
    </Chatbot>
  );
};
