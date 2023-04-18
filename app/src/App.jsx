import { useState } from "react";
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
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = {
  //  Explain things like you're talking to a software professional with 5 years of experience.
  role: "system",
  content:
    "Explain things like you're a veterinarian giving advice about pets.",
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
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSend = async (message) => {
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

  const handleAttachClick = () => {
    // open the file dialog box to let user select files to upload
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*, video/*";
    fileInput.addEventListener("change", async () => {
      // handle the file(s) selected by the user
      const files = fileInput.files;
      if (files && files.length > 0) {
        // do something with the file(s)
        // For example, you can upload the file(s) to a server
        // and then display a hard coded message to indicate that the file(s) have been uploaded
        const newMessage = {
          message: "Your file(s) have been uploaded.",
          sentTime: "just now",
          sender: "VetBot",
        };
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
      }
    });
    handleAttachChange({ target: { files: fileInput.files } });
    fileInput.click();
  };

  function handleRemoveFile(index) {
    setUploadedFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
  }

  function handleAttachChange(event) {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  return (
    <Container className="contain">
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
                <ChatContainer style={{ maxWidth: "800px", margin: "0 auto" }}>
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
                      return <Message key={i} model={message} />;
                    })}
                  </MessageList>
                  <MessageInput
                    id="textfield"
                    placeholder="Type message here"
                    onSend={handleSend}
                    attachButton={true}
                    onAttachClick={handleAttachClick}
                    showPreview={true}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={handleRemoveFile}
                  />
                </ChatContainer>
              </MainContainer>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
