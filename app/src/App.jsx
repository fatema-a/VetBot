// This is a React web application that allows users to chat with a veterinary bot to ask for advice on pets. 
// The app utilizes the @chatscope/chat-ui-kit-react and OpenAI's GPT-3.5-turbo model to process user's messages and generate responses. 
// The `App()` function sets the initial state of the `messages` array, `isTyping`, `uploadedFiles`, and `pendingFiles` using the `useState` hook from React. 
// It then defines the `handleSend`, `processMessageToChatGPT`, `handleAttachClick`, `handleRemoveFile`, 
// and `handleAttachChange` functions which are used to handle user inputs such as sending a message, uploading a file, or removing a file.
// The app renders a container that includes a `MainContainer` component from `@chatscope/chat-ui-kit-react` library, 
// which contains a `ChatContainer`, `MessageList`, and `MessageInput` components. The `MessageList` component renders all the messages from the `messages` array. 
// The `MessageInput` component allows the user to enter a new message and send it using the `handleSend` function. 
// The `ChatContainer` component also renders a `TypingIndicator` component which is displayed when `isTyping` is set to true.
// The app also includes the `handleAttachClick`, `handleRemoveFile`, and `handleAttachChange` functions to handle file uploads. 
// When the user clicks the "Attach" button, the `handleAttachClick` function creates an `input` element of type "file" and opens the file picker. 
// Once the user selects a file, the `handleAttachChange` function adds the file to the `pendingFiles` state. 
// Finally, when the user sends the message, the `processMessageToChatGPT` function is called to process the message and generate a response from the veterinary bot.

import { useState, useEffect } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { Container, Row, Col } from "react-bootstrap";
import vet from "./VetBot_logo.png";


const API_KEY = "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";

const systemMessage = {
  role: "system",
  content:
    "Explain things like you're a veterinarian giving advice about pets, if you dont know what to do act like a scheduler for a vet",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm VetBot! Ask me anything!",
      sentTime: "just now",
      sender: "VetBot",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const handleSend1 = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const handleSend = async (message) => {
    let newMessage;
    let responseMessage = null;
    let newMessages;
    const fileNames = pendingFiles.map((file) => file.name).join(", ");

    if (fileNames) {
      newMessage = {
        message: `${message} \n <span className="message" style="font-size: 12px; color: #90EE90"> <b> File(s) Sent: ${fileNames} </b> </span>`,
        direction: "outgoing",
        sender: "user",
        fileUrl: pendingFiles.map((file) => URL.createObjectURL(file)),
      };

      responseMessage = {
        message:
          "Your file(s) have been received and will be reviewed by a professional. Could you provide more information?",
        sentTime: "just now",
        sender: "VetBot",
      };
    } else {
      newMessage = {
        message,
        direction: "outgoing",
        sender: "user",
      };
    }

    if (responseMessage != null) {
      newMessages = [...messages, newMessage, responseMessage];
    } else {
      newMessages = [...messages, newMessage];
    }

    setMessages(newMessages);
    setPendingFiles([]);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };
  

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "VetBot") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  /**
   * This function handles the attachment click event. 
   * When the user clicks on the attachment icon, it creates a new input element
   * of type file and accepts image and video files. 
   * After the user selects a file, the function creates a new message object
   * containing the file details, adds it to the messages state, and sends it to the server for processing.
   */
  const handleAttachClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*, video/*";
    fileInput.addEventListener("change", async () => {
      const files = fileInput.files;
      if (files && files.length > 0) {
        /* const fileUrl = URL.createObjectURL(files[0]);
        const fileName = files[0].name;

        const newMessage = {
          message: `Uploaded file: <a href="${fileUrl}" target="_blank" className="message">${fileName}</a>`,
          sentTime: "just now",
          sender: "user",
          fileUrl: fileUrl,
          direction: "outgoing",
        };

        const responseMessage = {
          message:
            "Your file(s) have been received and will be reviewed by a professional. Could you provide more information?",
          sentTime: "just now",
          sender: "VetBot",
        };

        const responseMessages = [...messages, newMessage, responseMessage];
        setMessages(responseMessages); */
        setPendingFiles([...pendingFiles, ...files]);
        setIsTyping(true);
      }
    });
    handleAttachChange({ target: { files: fileInput.files } });
    fileInput.click();
  };

  function handleRemoveFile(index) {
    setPendingFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  }

  /**
   * Callback function that is triggered when the user selects a file to attach.
   * Args: event: A browser event object that contains information about the user's action.
   *  
   */
  function handleAttachChange(event) {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPendingFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  return (
    <Container>
      <Row>
        <Col>
          <div className="App">
            <div style={{ height: "30rem" }}>
              <div
                className="top containRequest"
                style={{ marginBottom: "-30px" }}
              >
                <img className="vet-pic" src={vet}></img>
                <h2 className="div-title">VetBot</h2>
              </div>
              <MainContainer>
                <ChatContainer className="chat-container" >
                  <MessageList
                    scrollBehavior="smooth"
                    typingIndicator={
                      isTyping ? (
                        <TypingIndicator content="VetBot is typing" />
                      ) : null
                    }
                  >
                    {messages.map((message, i) => {
                      console.log(message);
                      return (
                        <Message key={i} model={message} className="message" />
                      );
                    })}
                  </MessageList>
                  <MessageInput
                    id="textfield"
                    placeholder="Type message here"
                    onSend={handleSend}
                    attachButton={true}
                    onAttachClick={handleAttachClick}
                    showPreview={true}
                    uploadedFiles={pendingFiles}
                    onRemoveFile={handleRemoveFile}
                  />
                </ChatContainer>
              </MainContainer>

              {pendingFiles.length > 0 && (
                <div
                  style={{
                    maxWidth: "800px",
                    maxHeight: "150px",
                    minHeight: "150px",
                    margin: "0",
                    backgroundColor: "#b8e6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {pendingFiles.map((file, i) => {
                    return (
                      <div
                        key={i}
                        style={{
                          position: "relative",
                          display: "inline-block",
                          marginRight: "5px",
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`File ${i}`}
                          style={{
                            maxWidth: "50px",
                            maxHeight: "50px",
                            objectFit: "contain",
                          }}
                        />
                        <button
                          style={{
                            position: "absolute",
                            top: "0",
                            right: "0",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            outline: "none",
                          }}
                          onClick={() => handleRemoveFile(i)}
                        >
                          <span
                            style={{ marginRight: "-30px" }}
                            role="img"
                            aria-label="remove"
                          >
                            ⛔
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
