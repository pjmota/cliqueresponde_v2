import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
<<<<<<< HEAD
import { Select, Typography, useMediaQuery, useTheme } from '@material-ui/core';
=======
import { useMediaQuery, useTheme } from '@material-ui/core';
>>>>>>> organizacional/main
import { isNil } from "lodash";
import {
  CircularProgress,
  ClickAwayListener,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Hidden,
  Menu,
  MenuItem,
  Tooltip,
  Fab,
} from "@material-ui/core";
import {
  blue,
  green,
  pink,
  grey,
} from "@material-ui/core/colors";
import {
  AttachFile,
  CheckCircleOutline,
  Clear,
  Comment,
  Create,
  Description,
  HighlightOff,
  Mic,
  Mood,
  MoreVert,
  Send,
  PermMedia,
  Person,
  Reply,
  Duo,
  Timer,
  WhatsApp,
<<<<<<< HEAD
  AccountTree,
=======
>>>>>>> organizacional/main
} from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import { CameraAlt } from "@material-ui/icons";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";

import useQuickMessages from "../../hooks/useQuickMessages";
import { isString, isEmpty } from "lodash";
import ContactSendModal from "../ContactSendModal";
import CameraModal from "../CameraModal";
import axios from "axios";

import useCompanySettings from "../../hooks/useSettings/companySettings";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";
import MessageUploadMedias from "../MessageUploadMedias";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import ScheduleModal from "../ScheduleModal";
import usePlans from "../../hooks/usePlans";
import TemplateModal from "../TemplateMetaModal";
<<<<<<< HEAD
import { toast } from "react-toastify";
=======
>>>>>>> organizacional/main


const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 0,
      width: "100%",
    },
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "25%",
  },
  dropInfo: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: 15,
    left: 0,
    right: 0,
  },
  dropInfoOut: {
    display: "none",
  },
  gridFiles: {
    maxHeight: "100%",
    overflow: "scroll",
  },
  newMessageBox: {
    background: theme.palette.background.default,
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },
  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    background: theme.palette.background.paper,
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
  },
  messageInputWrapperPrivate: {
    padding: 6,
    marginRight: 7,
    background: "#F0E68C",
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
  },
  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",

  },
  messageInputPrivate: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
    color: grey[800],

  },
  sendMessageIcons: {
    color: grey[700],
  },
  ForwardMessageIcons: {
    color: grey[700],
    transform: 'scaleX(-1)'
  },
  uploadInput: {
    display: "none",
  },
  viewMediaInputWrapper: {
    maxHeight: "100%",
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.mode === 'light' ? "#ffffff" : "#202c33",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },
  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },
  audioLoading: {
    color: green[500],
    opacity: "70%",
  },
  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },
  cancelAudioIcon: {
    color: "red",
  },
  sendAudioIcon: {
    color: "green",
  },
  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
    backgroundColor: theme.palette.optionsBackground,
  },
  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: theme.mode === "light" ? "#f0f0f0" : "#1d282f", //"rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },
  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },
  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },
  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },
  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
  messageQuickAnswersWrapper: {
    margin: 0,
    position: "absolute",
    bottom: "50px",
    background: theme.palette.background.default,
    padding: 0,
    border: "none",
    left: 0,
    width: "100%",
    "& li": {
      listStyle: "none",
      "& a": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "30px",
        "&:hover": {
          background: theme.palette.background.paper,
          cursor: "pointer",
        },
      },
    },
  },
  invertedFabMenu: {
    border: "none",
    borderRadius: 50, // Define o raio da borda para 0 para remover qualquer borda
    boxShadow: "none", // Remove a sombra
    padding: theme.spacing(1),
    backgroundColor: "transparent",
    color: "grey",
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&:disabled": {
      backgroundColor: "transparent !important",
    },
  },
  invertedFabMenuMP: {
    border: "none",
    borderRadius: 0, // Define o raio da borda para 0 para remover qualquer borda
    boxShadow: "none", // Remove a sombra
    width: theme.spacing(4), // Ajuste o tamanho de acordo com suas preferências
    height: theme.spacing(4),
    backgroundColor: "transparent",
    color: blue[800],
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  invertedFabMenuCont: {
    border: "none",
    borderRadius: 0, // Define o raio da borda para 0 para remover qualquer borda
    boxShadow: "none", // Remove a sombra
    minHeight: "auto",
    width: theme.spacing(4), // Ajuste o tamanho de acordo com suas preferências
    height: theme.spacing(4),
    backgroundColor: "transparent",
    color: blue[500],
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  invertedFabMenuMeet: {
    border: "none",
    borderRadius: 0, // Define o raio da borda para 0 para remover qualquer borda
    boxShadow: "none", // Remove a sombra
    minHeight: "auto",
    width: theme.spacing(4), // Ajuste o tamanho de acordo com suas preferências
    height: theme.spacing(4),
    backgroundColor: "transparent",
    color: green[500],
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  invertedFabMenuDoc: {
    border: "none",
    borderRadius: 0, // Define o raio da borda para 0 para remover qualquer borda
    boxShadow: "none", // Remove a sombra
    width: theme.spacing(4), // Ajuste o tamanho de acordo com suas preferências
    height: theme.spacing(4),
    backgroundColor: "transparent",
    color: "#7f66ff",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  invertedFabMenuCamera: {
    border: "none",
    borderRadius: 0, // Define o raio da borda para 0 para remover qualquer borda
    boxShadow: "none", // Remove a sombra
    width: theme.spacing(4), // Ajuste o tamanho de acordo com suas preferências
    height: theme.spacing(4),
    backgroundColor: "transparent",
    color: pink[500],
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  flexContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  flexItem: {
    flex: 1,
  },
<<<<<<< HEAD
  integrationBox: {
    position: "absolute",
    bottom: 70,
    left: 110,
    width: 160,
    borderTop: "1px solid #e8e8e8",
    padding: '8px',
    borderRadius: '4px',
    background: 'white'
  },

  integrationText: {
    fontSize: '1rem'
  },
=======
>>>>>>> organizacional/main
}));

const MessageInput = ({ ticketId, ticketStatus, droppedFiles, contactId, ticketChannel }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [mediasUpload, setMediasUpload] = useState([]);
  const isMounted = useRef(true);

  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [onDragEnter, setOnDragEnter] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { setReplyingMessage, replyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(EditMessageContext);
  const { user } = useContext(AuthContext);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const { getPlanCompany } = usePlans();

  const [signMessagePar, setSignMessagePar] = useState(false);
  const { get: getSetting } = useCompanySettings();
  const [signMessage, setSignMessage] = useState(true);
  const [privateMessage, setPrivateMessage] = useState(false);
  const [privateMessageInputVisible, setPrivateMessageInputVisible] = useState(false);
  const [senVcardModalOpen, setSenVcardModalOpen] = useState(false);
  const [showModalMedias, setShowModalMedias] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [useWhatsappOfficial, setUseWhatsappOfficial] = useState(false);
  const { list: listQuickMessages } = useQuickMessages();

<<<<<<< HEAD
  const [showIntegration, setShowIntegration] = useState(false);
  const [integration, setIntegration] = useState(0);
  const [integrations, setIntegrations] = useState([]);

=======
>>>>>>> organizacional/main

  const isMobile = useMediaQuery('(max-width: 767px)'); // Ajuste o valor conforme necessário
  const [placeholderText, setPlaceHolderText] = useState("");

  useEffect(() => {
    async function fetchTemplates() {
      const templates = await api.request({
        url: `/quick-messages/list`,
        method: 'GET',
        params: {
          isOficial: "true",
          userId: user.id,
          companyId: user.companyId,
          status: "APPROVED"
        }
      });
      setTemplates(templates.data);
    }
    if (useWhatsappOfficial) {
      fetchTemplates();
    }
  }, [useWhatsappOfficial]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      setShowSchedules(planConfigs.plan.useSchedules);
      setUseWhatsappOfficial(planConfigs.plan.useWhatsappOfficial);
    }
    fetchData();
<<<<<<< HEAD
    getIntegration();
=======
>>>>>>> organizacional/main
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Determine o texto do placeholder com base no ticketStatus
  useEffect(() => {
    if (ticketStatus === "open" || ticketStatus === "group") {
      setPlaceHolderText(i18n.t("messagesInput.placeholderOpen"));
    } else {
      setPlaceHolderText(i18n.t("messagesInput.placeholderClosed"));
    }

    // Limitar o comprimento do texto do placeholder apenas em ambientes mobile
    const maxLength = isMobile ? 20 : Infinity; // Define o limite apenas em mobile

    if (isMobile && placeholderText.length > maxLength) {
      setPlaceHolderText(placeholderText.substring(0, maxLength) + "...");
    }
  }, [ticketStatus])

  const {
    selectedMessages,
    setForwardMessageModalOpen,
    showSelectMessageCheckbox } = useContext(ForwardMessageContext);

  useEffect(() => {
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedMedias = Array.from(droppedFiles);
      setMediasUpload(selectedMedias);
      setShowModalMedias(true);
    }
  }, [droppedFiles]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    if (editingMessage) {
      setInputMessage(editingMessage.body);
    }
  }, [replyingMessage, editingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMediasUpload([]);
      setReplyingMessage(null);
      //setSignMessage(true);
      setPrivateMessage(false);
      setPrivateMessageInputVisible(false)
      setEditingMessage(null);
    };
  }, [ticketId, setReplyingMessage, setEditingMessage]);

  useEffect(() => {
    setTimeout(() => {
      if (isMounted.current)
        setOnDragEnter(false);
    }, 1000);
    // eslint-disable-next-line
  }, [onDragEnter === true]);

  //permitir ativar/desativar firma
  useEffect(() => {
    const fetchSettings = async () => {
      const setting = await getSetting({
        "column": "sendSignMessage"
      });

      if (isMounted.current) {
        if (setting.sendSignMessage === "enabled") {
          setSignMessagePar(true);
          const signMessageStorage = JSON.parse(
            localStorage.getItem("persistentSignMessage")
          );
          if (isNil(signMessageStorage)) {
            setSignMessage(true)
          } else {
            setSignMessage(signMessageStorage);
          }
        } else if (setting.sendSignMessage === "dontSend") {
          localStorage.setItem("persistentSignMessage", false);
          setSignMessage(false);
          setSignMessagePar(false);
        } else {
          setSignMessagePar(false);
        }
      }
    };
    fetchSettings();
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleSendLinkVideo = async () => {
    const link = `https://meet.jit.si/${ticketId}`;
    setInputMessage(link);
  }

  const handleSendTemplate = async () => {
    setTemplateModalOpen(true);
  }

  const handleChangeInput = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  const handlePrivateMessage = (e) => {
    setPrivateMessage(!privateMessage);
    setPrivateMessageInputVisible(!privateMessageInputVisible);
  };

  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const { data } = await axios.get(value.mediaPath, {
          responseType: "blob",
        });

        handleUploadQuickMessageMedia(data, value.value);
        setInputMessage("");
        return;
        //  handleChangeMedias(response)
      } catch (err) {
        toastError(err);
      }
    }

    setInputMessage("");
    setInputMessage(value.value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const [modalCameraOpen, setModalCameraOpen] = useState(false);

  const handleCapture = (imageData) => {
    if (imageData) {
      handleUploadCamera(imageData);
    }
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }
    const selectedMedias = Array.from(e.target.files);
    setMediasUpload(selectedMedias);
    setShowModalMedias(true);
  };

  const handleChangeSign = (e) => {
    getStatusSingMessageLocalstogare();
  };

  const handleOpenModalForward = () => {
    if (selectedMessages.length === 0) {
      setForwardMessageModalOpen(false)
      toastError(i18n.t("messagesList.header.notMessage"));
      return;
    }
    setForwardMessageModalOpen(true);
  }

  const getStatusSingMessageLocalstogare = () => {
    const signMessageStorage = JSON.parse(
      localStorage.getItem("persistentSignMessage")
    );
    //si existe uma chave "sendSingMessage"
    if (signMessageStorage !== null) {
      if (signMessageStorage) {
        localStorage.setItem("persistentSignMessage", false);
        setSignMessage(false);
      } else {
        localStorage.setItem("persistentSignMessage", true);
        setSignMessage(true);
      }
    } else {
      localStorage.setItem("persistentSignMessage", false);
      setSignMessage(false);
    }
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMediasUpload(selectedMedias);
      setShowModalMedias(true);
    }
  };

  const handleInputDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const selectedMedias = Array.from(e.dataTransfer.files);
      setMediasUpload(selectedMedias);
      setShowModalMedias(true);
    }
  };

  const handleUploadMedia = async (mediasUpload) => {
    setLoading(true);
    // e.preventDefault();

    // Certifique-se de que a variável medias esteja preenchida antes de continuar
    if (!mediasUpload.length) {
<<<<<<< HEAD
      //console.log("Nenhuma mídia selecionada.");
=======
      console.log("Nenhuma mídia selecionada.");
>>>>>>> organizacional/main
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("fromMe", true);
    formData.append("isPrivate", privateMessage ? "true" : "false");
    mediasUpload.forEach((media) => {
      formData.append("body", media.caption);
      formData.append("medias", media.file);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMediasUpload([]);
    setShowModalMedias(false);
    setPrivateMessage(false);
    setPrivateMessageInputVisible(false)
  };

  const handleSendContatcMessage = async (vcard) => {
    setSenVcardModalOpen(false);
    setLoading(true);

    if (isNil(vcard)) {
      setLoading(false);
      return;
    }

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: null,
      quotedMsg: replyingMessage,
      isPrivate: privateMessage ? "true" : "false",
      vCard: vcard,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setEditingMessage(null);
    setPrivateMessage(false);
    setPrivateMessageInputVisible(false);
  };

  const handleSendMessage = async () => {

    if (inputMessage.trim() === "") return;
    setLoading(true);

    const userName = privateMessage
      ? `${user.name} - Mensagem Privada`
      : user.name;

    const sendMessage = inputMessage.trim();

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: (signMessage || privateMessage) && !editingMessage
        ? `*${userName}:*\n${sendMessage}`
        : sendMessage,
      quotedMsg: replyingMessage,
      isPrivate: privateMessage ? "true" : "false",
    };

    try {
      if (editingMessage !== null) {
        await api.post(`/messages/edit/${editingMessage.id}`, message);
      } else {
<<<<<<< HEAD
        //console.log("ENVIOU PARA TIKCET", ticketId)
=======
        console.log("ENVIOU PARA TIKCET", ticketId)
>>>>>>> organizacional/main
        await api.post(`/messages/${ticketId}`, message);
      }
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setPrivateMessage(false);
    setEditingMessage(null);
    setPrivateMessageInputVisible(false)
    handleMenuItemClick();
  };

  const handleSendMessageTemplate = async (e) => {
    if (e.id === "") return;
    setLoading(true);

    const message = {
      templateId: e.id,
      variables: e.variables,
      bodyToSave: e.bodyToSave,
      mediaUrl: "",
      quotedMsg: replyingMessage,
    };

    try {
      await api.post(`/messages-template/${ticketId}`, message);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setTemplateModalOpen(false);
    setInputMessage("");
    setShowEmoji(false);
    setReplyingMessage(null);
    setPrivateMessage(false);
    setEditingMessage(null);
    setPrivateMessageInputVisible(false)
    handleMenuItemClick();
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const messages = await listQuickMessages({ companyId, userId: user.id, isOficial: ticketChannel === "whatsapp_oficial" ? "true" : "false" });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 90) {
          truncatedMessage = m.message.substring(0, 90) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
        };
      });
      if (isMounted.current) {

        setQuickAnswer(options);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length >= 1
    ) {
      const firstWord = inputMessage.charAt(0);

      if (firstWord === "/") {
        setTypeBar(firstWord.indexOf("/") > -1);

        const filteredOptions = quickAnswers.filter(
          (m) => m.label.toLowerCase().indexOf(inputMessage.toLowerCase()) > -1
        );
        setTypeBar(filteredOptions);
      } else {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  const disableOption = () => {
    return (
      loading ||
      recording ||
      (ticketStatus !== "open" && ticketStatus !== "group")
    );
  };

  const handleUploadCamera = async (blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = `${new Date().getTime()}.png`;
      formData.append("medias", blob, filename);
      formData.append("body", privateMessage ? `\u200d` : "");
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];

      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body", privateMessage ? `\u200d${message}` : message);
      formData.append("fromMe", true);

      if (isMounted.current) {
        await api.post(`/messages/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };


  const handleUploadAudio = async () => {

    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = ["whatsapp", "whatsapp_oficial"].includes(ticketChannel) ? `${new Date().getTime()}.mp3` : `${new Date().getTime()}.m4a`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      if (isMounted.current) {
        await api.post(`/messages/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRecording(false);
      }
    }
  };

  const handleCloseModalMedias = () => {
    setShowModalMedias(false);
  };
  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event) => {
    setAnchorEl(null);
  };

  const handleSendContactModalOpen = async () => {
    handleMenuItemClick();
    setSenVcardModalOpen(true);
  };

  const handleCameraModalOpen = async () => {
    handleMenuItemClick();
    setModalCameraOpen(true);
  };

  const handleCancelSelection = () => {
    setMediasUpload([]);
    setShowModalMedias(false);
  };

<<<<<<< HEAD

  const handleSaveIntegration = async (e) => {
 
    const id = e.target.value

    if (id === 0) {
      toast.error('Selecione um fluxo');
    }

    setIntegration(e.target.value)

    const data = {
      integrationId: id
    }

    try {
      await api.request({
        url: `/tickets/${ticketId}/integration`,
        method: "POST",
        data
      });
      setShowIntegration(false);
      toast.success('Fluxo iniciado com sucesso.');
    } catch (error) {
      toast.error('Erro ao enviar fluxo')
    }

    setIntegration(undefined);
    
  };

  const getIntegration = async () => {
    const { data } = await api.get("/queueIntegration/");
    setIntegrations(data.queueIntegrations)
  }

=======
>>>>>>> organizacional/main
  const renderReplyingMessage = (message) => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          {replyingMessage && (
            <div className={classes.replyginMsgBody}>
              {!message.fromMe && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              {message.body}
            </div>
          )
          }
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={disableOption()}
          onClick={() => {
            setReplyingMessage(null);
            setEditingMessage(null);
            setInputMessage("");
          }}
        >
          <Clear className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (mediasUpload.length > 0) {
    return (

      <Paper
        elevation={0}
        square
        className={classes.viewMediaInputWrapper}
        onDragEnter={() => setOnDragEnter(true)}
        onDrop={(e) => handleInputDrop(e)}
      >
        {showModalMedias && (
          <MessageUploadMedias
            isOpen={showModalMedias}
            files={mediasUpload}
            onClose={handleCloseModalMedias}
            onSend={handleUploadMedia}
            onCancelSelection={handleCancelSelection}
          />
        )}

      </Paper>
    )
  }
  else {
    return (
      <>
        {templateModalOpen && (
          <TemplateModal
            open={templateModalOpen}
            handleClose={() => setTemplateModalOpen(false)}
            onSelectTemplate={(e) => handleSendMessageTemplate(e)}
            templates={templates}
          />
        )}
        {modalCameraOpen && (
          <CameraModal
            isOpen={modalCameraOpen}
            onRequestClose={() => setModalCameraOpen(false)}
            onCapture={handleCapture}
          />
        )}
        {senVcardModalOpen && (
          <ContactSendModal
            modalOpen={senVcardModalOpen}
            onClose={(c) => {
              handleSendContatcMessage(c);
            }}
          />
        )}
        <Paper
          square
          elevation={0}
          className={classes.mainWrapper}
          onDragEnter={() => setOnDragEnter(true)}
          onDrop={(e) => handleInputDrop(e)}
        >
          {(replyingMessage && renderReplyingMessage(replyingMessage)) || (editingMessage && renderReplyingMessage(editingMessage))}
          <div className={classes.newMessageBox}>
            <Hidden only={["sm", "xs"]}>
              <IconButton
                aria-label="emojiPicker"
                component="span"
                disabled={disableOption()}
                onClick={(e) => setShowEmoji((prevState) => !prevState)}
              >
                <Mood className={classes.sendMessageIcons} />
              </IconButton>
              {showEmoji ? (
                <div className={classes.emojiBox}>
                  <ClickAwayListener onClickAway={(e) => setShowEmoji(true)}>
                    <Picker
                      perLine={16}
                      theme={"dark"}
                      i18n={i18n}
                      showPreview={true}
                      showSkinTones={false}
                      onSelect={handleAddEmoji}
                    />
                  </ClickAwayListener>
                </div>
              ) : null}

              <Fab
                disabled={disableOption()}
                aria-label="uploadMedias"
                component="span"
                className={classes.invertedFabMenu}
                onClick={handleOpenMenuClick}
              >
                <AddIcon />
              </Fab>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuItemClick}
                id="simple-menu"
              >
                <MenuItem onClick={handleMenuItemClick}>
                  <input
                    multiple
                    type="file"
                    id="upload-img-button"
                    accept="image/*, video/*, audio/* "
                    // disabled={disableOption()}
                    className={classes.uploadInput}
                    onChange={handleChangeMedias}
                  />
                  <label htmlFor="upload-img-button">
                    <Fab
                      aria-label="upload-img"
                      component="span"
                      className={classes.invertedFabMenuMP}
                    >
                      <PermMedia />
                    </Fab>
                    {i18n.t("messageInput.type.imageVideo")}
                  </label>
                </MenuItem>
                <MenuItem onClick={handleCameraModalOpen}>
                  <Fab className={classes.invertedFabMenuCamera}>
                    <CameraAlt />
                  </Fab>
                  {i18n.t("messageInput.type.cam")}
                </MenuItem>
                <MenuItem onClick={handleMenuItemClick}>
                  <input
                    multiple
                    type="file"
                    id="upload-doc-button"
                    accept="application/*, text/*"
                    // disabled={disableOption()}
                    className={classes.uploadInput}
                    onChange={handleChangeMedias}
                  />
                  <label htmlFor="upload-doc-button">
                    <Fab aria-label="upload-img"
                      component="span" className={classes.invertedFabMenuDoc}>
                      <Description />
                    </Fab>
                    Documento
                  </label>
                </MenuItem>
                <MenuItem onClick={handleSendContactModalOpen}>
                  <Fab className={classes.invertedFabMenuCont}>
                    <Person />
                  </Fab>
                  {i18n.t("messageInput.type.contact")}
                </MenuItem>
                <MenuItem onClick={handleSendLinkVideo}>
                  <Fab className={classes.invertedFabMenuMeet}>
                    <Duo />
                  </Fab>
                  {i18n.t("messageInput.type.meet")}
                </MenuItem>
                {(useWhatsappOfficial && ticketChannel === "whatsapp_oficial") && (
                  <MenuItem onClick={handleSendTemplate}>
                    <Fab className={classes.invertedFabMenuMeet}>
                      <WhatsApp />
                    </Fab>
                    {i18n.t("messageInput.type.template")}
                  </MenuItem>
                )}
              </Menu>
              {/* <IconButton
<<<<<<< HEAD
                aria-label="upload"
                component="span"
                disabled={disableOption()}
                onMouseOver={() => setOnDragEnter(true)}
              >
                <AttachFile className={classes.sendMessageIcons} />
              </IconButton> */
              }
              <Tooltip title={i18n.t("messageInput.tooltip.sendIntegration")}>
                <IconButton
                  aria-label="emojiPicker"
                  component="span"
                  //disabled={disabled}
                  onClick={() => setShowIntegration((prev) => !prev)}
                >
                  <AccountTree className={classes.sendMessageIcons} />
                </IconButton>
              </Tooltip>
              {showIntegration && (
                <div className={classes.integrationBox}>
                  <Typography className={classes.integrationText}>Enviar um fluxo</Typography>
                  <Select
                    style={{width: '100%', padding: 5}}
                    fullWidth
                    value={integration}
                    onChange={(e) => handleSaveIntegration(e) }
                  >
                    <MenuItem value={0}>{ 'Selecione...' }</MenuItem>
                    { integrations.map((item, index) => {
                      return <MenuItem value={item.id} key={index}>{ item.name }</MenuItem>
                    })}
                  </Select>
                </div>
              )}

=======
				  aria-label="upload"
				  component="span"
				  disabled={disableOption()}
				  onMouseOver={() => setOnDragEnter(true)}
				>
				  <AttachFile className={classes.sendMessageIcons} />
				</IconButton> */}

              {/* </label> */}
>>>>>>> organizacional/main
              {signMessagePar && (
                <Tooltip title={i18n.t("messageInput.tooltip.signature")}>
                  <IconButton
                    aria-label="send-upload"
                    component="span"
                    onClick={handleChangeSign}
                  >
                    {signMessage === true ? (
                      <Create style={{ color: theme.mode === "light" ? theme.palette.primary.main : "#EEE" }} />
                    ) : (
                      <Create style={{ color: "grey" }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={i18n.t("messageInput.tooltip.privateMessage")}>
                <IconButton
                  aria-label="send-upload"
                  component="span"
                  onClick={handlePrivateMessage}
                >
                  {privateMessage === true ? (
                    <Comment style={{ color: theme.mode === "light" ? theme.palette.primary.main : "#EEE" }} />
                  ) : (
                    <Comment style={{ color: "grey" }} />
                  )}
                </IconButton>
              </Tooltip>
              {/* <Tooltip title={i18n.t("messageInput.tooltip.meet")}>
                <IconButton
                  aria-label="send-upload"
                  component="span"
                  onClick={handleSendLinkVideo}
                >
                  <Duo style={{ color: "grey" }} />
                </IconButton>
              </Tooltip> */}
            </Hidden>
            <Hidden only={["md", "lg", "xl"]}>
              <IconButton
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleOpenMenuClick}
              >
                <MoreVert></MoreVert>
              </IconButton>
              <Menu
                id="simple-menu"
                keepMounted
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuItemClick}
              >
                <MenuItem onClick={handleMenuItemClick}>
                  <IconButton
                    aria-label="emojiPicker"
                    component="span"
                    disabled={disableOption()}
                    onClick={(e) => setShowEmoji((prevState) => !prevState)}
                  >
                    <Mood className={classes.sendMessageIcons} />
                  </IconButton>
                </MenuItem>
                <MenuItem onClick={handleMenuItemClick}>
                  <input
                    multiple
                    type="file"
                    id="upload-button"
                    disabled={disableOption()}
                    className={classes.uploadInput}
                    onChange={handleChangeMedias}
                  />
                  <label htmlFor="upload-button">
                    <IconButton
                      aria-label="upload"
                      component="span"
                      disabled={disableOption()}
                    >
                      <AttachFile className={classes.sendMessageIcons} />
                    </IconButton>
                  </label>
                </MenuItem>
                {signMessagePar && (
                  <Tooltip title="Habilitar/Desabilitar Assinatura">
                    <IconButton
                      aria-label="send-upload"
                      component="span"
                      onClick={handleChangeSign}
                    >
                      {signMessage === true ? (
                        <Create style={{ color: theme.mode === "light" ? theme.palette.primary.main : "#EEE" }} />
                      ) : (
                        <Create style={{ color: "grey" }} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Habilitar/Desabilitar Comentários">
                  <IconButton
                    aria-label="send-upload"
                    component="span"
                    onClick={handlePrivateMessage}
                  >
                    {privateMessage === true ? (
                      <Comment style={{ color: theme.mode === "light" ? theme.palette.primary.main : "#EEE" }} />
                    ) : (
                      <Comment style={{ color: "grey" }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Menu>
            </Hidden>
            <div className={classes.flexContainer}>
              {privateMessageInputVisible && (
                <div className={classes.flexItem}>
                  <div className={classes.messageInputWrapperPrivate}>
                    <InputBase
                      inputRef={(input) => {
                        input && input.focus();
                        input && (inputRef.current = input);
                      }}
                      className={classes.messageInputPrivate}
                      placeholder={
                        ticketStatus === "open" || ticketStatus === "group"
                          ? i18n.t("messagesInput.placeholderPrivateMessage")
                          : i18n.t("messagesInput.placeholderClosed")
                      }
                      multiline
                      maxRows={5}
                      value={capitalizeFirstLetter(inputMessage)}
                      onChange={handleChangeInput}
                      disabled={disableOption()}
                      onPaste={(e) => {
                        (ticketStatus === "open" || ticketStatus === "group") &&
                          handleInputPaste(e);
                      }}
                      onKeyPress={(e) => {
                        if (loading || e.shiftKey) return;
                        else if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}

                    />
                    {typeBar ? (
                      <ul className={classes.messageQuickAnswersWrapper}>
                        {typeBar.map((value, index) => {
                          return (
                            <li
                              className={classes.messageQuickAnswersWrapperItem}
                              key={index}
                            >
                              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                              <a onClick={() => handleQuickAnswersClick(value)}>
                                {`${value.label} - ${value.value}`}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              )}
              {!privateMessageInputVisible && (
                <div className={classes.flexItem}>
                  <div className={classes.messageInputWrapper}>
                    <InputBase
                      inputRef={(input) => {
                        input && input.focus();
                        input && (inputRef.current = input);
                      }}
                      className={classes.messageInput}
                      placeholder={placeholderText}
                      multiline
                      maxRows={5}
                      value={capitalizeFirstLetter(inputMessage)}
                      onChange={handleChangeInput}
                      disabled={disableOption()}
                      onPaste={(e) => {
                        (ticketStatus === "open" || ticketStatus === "group") &&
                          handleInputPaste(e);
                      }}
                      onKeyPress={(e) => {
                        if (loading || e.shiftKey) return;
                        else if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                    />
                    {typeBar ? (
                      <ul className={classes.messageQuickAnswersWrapper}>
                        {typeBar.map((value, index) => {
                          return (
                            <li
                              className={classes.messageQuickAnswersWrapperItem}
                              key={index}
                            >
                              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                              <a onClick={() => handleQuickAnswersClick(value)}>
                                {`${value.label} - ${value.value}`}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {!privateMessageInputVisible && (
              <>
                {showSchedules && (
                  <Tooltip title={i18n.t("tickets.buttons.scredule")}>
                    <IconButton
                      aria-label="scheduleMessage"
                      component="span"
                      onClick={() => setAppointmentModalOpen(true)}
                      disabled={loading}
                    >
                      <Timer className={classes.sendMessageIcons} />
                    </IconButton>
                  </Tooltip>
                )}
                {inputMessage || showSelectMessageCheckbox ? (
                  <>
                    <IconButton
                      aria-label="sendMessage"
                      component="span"
                      onClick={showSelectMessageCheckbox ? handleOpenModalForward : handleSendMessage}
                      disabled={loading}
                    >
                      {showSelectMessageCheckbox ?
                        <Reply className={classes.ForwardMessageIcons} /> : <Send className={classes.sendMessageIcons} />}
                    </IconButton>
                  </>
                ) : recording ? (
                  <div className={classes.recorderWrapper}>
                    <IconButton
                      aria-label="cancelRecording"
                      component="span"
                      fontSize="large"
                      disabled={loading}
                      onClick={handleCancelAudio}
                    >
                      <HighlightOff className={classes.cancelAudioIcon} />
                    </IconButton>
                    {loading ? (
                      <div>
                        <CircularProgress className={classes.audioLoading} />
                      </div>
                    ) : (
                      <RecordingTimer />
                    )}

                    <IconButton
                      aria-label="sendRecordedAudio"
                      component="span"
                      onClick={handleUploadAudio}
                      disabled={loading}
                    >
                      <CheckCircleOutline className={classes.sendAudioIcon} />
                    </IconButton>
                  </div>
                ) : (
                  <IconButton
                    aria-label="showRecorder"
                    component="span"
                    disabled={disableOption()}
                    onClick={handleStartRecording}
                  >
                    <Mic className={classes.sendMessageIcons} />
                  </IconButton>
                )}
              </>
            )}

            {privateMessageInputVisible && (
              <>
                <IconButton
                  aria-label="sendMessage"
                  component="span"
                  onClick={showSelectMessageCheckbox ? handleOpenModalForward : handleSendMessage}
                  disabled={loading}
                >
                  {showSelectMessageCheckbox ?
                    <Reply className={classes.ForwardMessageIcons} /> : <Send className={classes.sendMessageIcons} />}
                </IconButton>
              </>
            )}
            {appointmentModalOpen && (
              <ScheduleModal
                open={appointmentModalOpen}
                onClose={() => setAppointmentModalOpen(false)}
                message={inputMessage}
                contactId={contactId}
              />
            )}
          </div>
        </Paper>
      </>
    );
  }
};

export default MessageInput;