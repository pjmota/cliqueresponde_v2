import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import MessageInput from './../../components/MessageInputCustom/';
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import ModalImageCors from "../../components/ModalImageCors";


const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
  },
  inputArea: {
    position: "relative",
    height: "auto",
  },
  input: {
    padding: "20px",
  },
  buttonSend: {
    margin: theme.spacing(1),
  },
  boxLeft: {
    padding: "10px 10px 5px",
    margin: "10px",
    position: "relative",
    backgroundColor: "#ffffff",
    color: "#303030",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  boxRight: {
    padding: "10px 10px 5px",
    margin: "10px 10px 10px auto",
    position: "relative",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    textAlign: "right",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const setPlaybackRate = (id) => {
    stopAllAudios(id);
    const element = document.getElementById(id);
    const playbackRate = localStorage.getItem('playbackRate');
    element.playbackRate = playbackRate ?? 1;
  }

  const stopAllAudios = (id) => {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      if (!audio.paused && audio.id !== id) {
        audio.pause();
      }
    })
  }

  const onChangePlaybackRate = (event) => {
    localStorage.setItem('playbackRate', event.target.playbackRate);
  }

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) { }
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            if (item.senderId === user.id) {
              return (
                <Box key={key} className={classes.boxRight}>
                  <Typography variant="subtitle2">
                    {item.sender.name}
                  </Typography>
                  {item.message}
                  <Typography variant="caption" display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            } else {
              return (
                <Box key={key} className={classes.boxLeft}>
                  <Typography variant="subtitle2">
                    {item.sender.name}
                  </Typography>
                  {item.message}
                  <Typography variant="caption" display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            }
          })}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <div onScroll={handleScroll} className={classes.messageList}>
          {Array.isArray(messages) &&
            messages.map((item, key) => {
              if (item.senderId === user.id) {
                return (
                  <Box key={key} className={classes.boxRight}>
                    <Typography variant="subtitle2">
                      {item.sender.name}
                    </Typography>

                    {!item.mediaType ? item.body?.replace(/\*\w+\:\*/g, '') : undefined}

                    {item.mediaType === "image" && (<ModalImageCors imageUrl={item.mediaUrl} /> || item.body)}

                    {item.mediaType === "audio" && (
                      <div className={classes.downloadMedia}>
                        <audio id={`audio_${item.id}`} controls onPlay={() => setPlaybackRate(`audio_${item.id}`)} onRateChange={onChangePlaybackRate}>
                          <source src={item.mediaUrl} type="audio/mpeg"></source>
                        </audio>
                      </div>
                    )}
                    <Typography variant="caption" display="block">
                      {datetimeToClient(item.createdAt)}
                    </Typography>
                  </Box>
                );
              } else {
                return (
                  <Box key={key} className={classes.boxLeft}>
                    <Typography variant="subtitle2">
                      {item.sender.name}
                    </Typography>

                    {!item.mediaType ? item.body?.replace(/\*\w+\:\*/g, '') : undefined}

                    {item.mediaType === "image" && (<ModalImageCors imageUrl={item.mediaUrl} /> || item.body)}

                    {item.mediaType === "audio" && (
                      <div className={classes.downloadMedia}>
                        <audio id={`audio_${item.id}`} controls onPlay={() => setPlaybackRate(`audio_${item.id}`)} onRateChange={onChangePlaybackRate}>
                          {item.quotedMsg?.mediaUrl && (
                            <source src={item.quotedMsg.mediaUrl} type="audio/mpeg"></source>
                          )}
                        </audio>
                      </div>
                    )}

                    <Typography variant="caption" display="block">
                      {datetimeToClient(item.createdAt)}
                    </Typography>
                  </Box>
                );
              }
            })}
          <div ref={baseRef}></div>
        </div>
        <ReplyMessageProvider>
          <MessageInput ticketStatus={'open'} showIntegrationOptions={false} baseUrl={`/chats/${chat.id}/messages`} />
        </ReplyMessageProvider>
        {/* <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && contentMessage.trim() !== "") {
                handleSendMessage(contentMessage);
                setContentMessage("");
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    if (contentMessage.trim() !== "") {
                      handleSendMessage(contentMessage);
                      setContentMessage("");
                    }
                  }}
                  className={classes.buttonSend}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl> */}
      </div>
    </Paper>
  );
}
