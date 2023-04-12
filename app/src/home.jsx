import { useState } from "react";
import "./Home.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Button } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import msgImg from "./conversation_chat_bubble_bubbles.png";

function Home() {
  return (
    <Container id="container">
      <Row id="msgImage">
        <Image src={msgImg} />
      </Row>
      <Row id="Title">
        <div>Welcome to VetBot</div>
      </Row>
      <Row id="Content">
        <div>
          Chat with an <br />
          artificial intelligent <br />
          veterinarian
        </div>
      </Row>
      <Row>
        <Button id="startButton">Start Chat</Button>
      </Row>
    </Container>
  );
}

export default Home;
