import React, { useState, useEffect, useContext, useReducer, Children } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";
import toastError from "../../errors/toastError";
import { Badge, Box, Tooltip, IconButton, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, useMediaQuery } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import Timer from "@material-ui/icons/Timer";
import Brightness1SharpIcon from '@mui/icons-material/Brightness1Sharp';
import ScheduleModal from "../../components/ScheduleModal";
import CircularProgress from "@material-ui/core/CircularProgress";
import EventIcon from '@material-ui/icons/Event';

import "./Kanban.css"
import { use } from "react";
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    gap: theme.spacing(2),
  },
  menu: {
    display: 'flex',
    justifyContent: "center",
    gap: theme.spacing(1.25),
  },
  cardName: {
    marginTop: theme.spacing(2),


  },

  ticketLabel: {

    borderRadius: theme.shape.borderRadius,
    display: "flex",
    color: theme.palette.common.black,
    justifyContent: "center",



  }
  ,
  kanbanContainer: {
    width: "100%",
    overflowY: "auto",
    overflowX: "auto",
    margin: "0 auto",
    position: "static",
    height: "82vh",
  },
  connectionTag: {
    background: theme.palette.success.main,
    color: theme.palette.common.white,
    marginRight: theme.spacing(0.125),
    padding: theme.spacing(0.125),
    fontWeight: 'bold',
    borderRadius: theme.shape.borderRadius,
    fontSize: "0.6em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto",
  },
  cardButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  dateInput: {
    marginRight: theme.spacing(0),
  },
}));

const StatusIcon = ({ status }) => {

  const colorMap = {
    pending: "#c4c5bd",
    closed: "#4CAF50",
    open: "#f7b904",
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Brightness1SharpIcon
        style={{
          color: colorMap[status],
          fontSize: "10px",
          marginRight: "5px",
          animation: "blink 10s linear infinite"
        }}
      />
      <style>{`
        @keyframes blink {
          0% { opacity: 0.5; }
          
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const CardFooter = ({ ticket, onScheduleButton, children }) => {


  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/schedules`, { params: { ticketId: ticket.id } });
      if (response.data.schedules.length === 0) {
        return;
      }

      //tira em todos os agendamentos que são justNotifyMe && type COMMON
      const filteredSchedules = response.data.schedules.filter(schedule => (!(schedule.justNotifyMe === false) || !(schedule.type === 'COMMON')));

      setSchedules(filteredSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLastSchedule = () => {
    if (schedules?.length === 0) {
      return null;
    }

    const lastSchedule = schedules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return lastSchedule;
  }

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (<>
    
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>

        {children}

        <IconButton
          aria-label="scheduleMessage"
          component="span"
          onClick={() => {
            onScheduleButton(null, ticket.contactId, ticket);
          }}
          disabled={loading}
        >
          <EventIcon />
        </IconButton>

      </div>
      <Typography
        variant="body2"
        color="textSecondary"
        component="p"
      >
        {loading ? (
          <span>{i18n.t("kanban.cards.loading")}</span>
        ) : (
          <>
            {schedules?.length > 0 ? <>
              <div

                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{i18n.t("kanban.cards.lastSchedule")} {new Date(getLastSchedule().sendAt).toLocaleDateString()} {new Date(getLastSchedule().sendAt).toLocaleTimeString()}</span>
                <IconButton
                  aria-label="scheduleMessage"
                  component="span"
                  onClick={() => {

                    onScheduleButton(getLastSchedule().id, ticket.contactId, ticket);

                  }}
                  disabled={loading}
                >
                  <Timer />
                </IconButton>
              </div>
            </> : (
              /*  <span>{i18n.t("kanban.cards.noSchedules")}</span> */
              <></>
            )}
          </>
        )}
      </Typography>
    

  </>)
}

const Kanban = () => {
  const classes = useStyles();
  //const theme = useTheme(); // Obter o tema atual
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  //const [ticketNot, setTicketNot] = useState(0);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [initialLoading, setInitialLoading] = useState(true);

  const [searchParam, setSearchParam] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState([{ id: 'pending', label: 'Pendente' }, { id: 'closed', label: 'Fechado' }, { id: 'open', label: 'Aberto' }]);
  const isAdmin = user.profile === "admin" || user.profile === "supervisor";
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleContactId, setScheduleContactId] = useState(null);
  const [scheduleTicket, setScheduleTicket] = useState(null);
  const userQueueIds = user.queues.map(queue => queue.UserQueue.queueId);


  const initialFilterSettings = {
    queueIds: userQueueIds,
    users: [],
    status: ['pending', 'open'],
    searchParam: '',
    hasTags: false
  };



  const handleOpenScheduleModal = (scheduleId, contactId, ticket) => {
    setSelectedSchedule(scheduleId);
    setScheduleContactId(contactId);
    setScheduleTicket(ticket);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
    setScheduleContactId(null);
    setScheduleTicket(null);

  };


  //TODO: Implementar o gerenciamento do estado cada ticket para atualizar cada ticket
  const handleSaveScheduleModal = () => {
    setInitialLoading(true);
    fetchTags().then((tags) => {
      setTickets([]);
      fetchTickets(filterSettings, tags).finally(() => {
        setInitialLoading(false);
      });
    });
  }

  const handleDeleteScheduleModal = () => {
    setInitialLoading(true);
    fetchTags().then((tags) => {
      setTickets([]);
      fetchTickets(filterSettings, tags).finally(() => {
        setInitialLoading(false);
      });
    });
  }




  function searchParamsReducer(state, action) {
    switch (action.type) {
      

      case 'INITIALIZE':

        return {
          ...state,
          queueIds: action.payload.queueIds ? action.payload.queueIds : [],
          users: action.payload.userId ? [action.payload.userId] : [],
        };
      case 'SET_USERS':
        return { ...state, users: action.payload };
      case 'SET_STATUS':
        return { ...state, status: action.payload };
      case 'SET_SEARCH_TERM':
        return { ...state, searchParam: action.payload };
      default:
        return state;
    }
  }

  const [filterSettings, dispatch] = useReducer(searchParamsReducer, initialFilterSettings);


  useEffect(() => {
    // Initialize reducer state with user's queues and ID
    setSelectedStatus(initialFilterSettings.status);
    dispatch({
      type: 'INITIALIZE',
      payload: {
        queueIds: userQueueIds,
        userId: null,
      }
    });

    loadInitialData();
    fetchUsers();
  }, []);

  // Separate the initial data loading function for better organization
  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const fetchedTags = await fetchTags();
      await fetchTickets(filterSettings, fetchedTags);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];

      const userTagIds = user.tags.map(tag => tag.id);
      const filteredTags = fetchedTags.filter(tag => userTagIds.includes(tag.id));
      setTags(filteredTags);
      return filteredTags;
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      // Don't set initialLoading to false here, as we want it to remain true
      // until fetchTickets also completes in the calling function
    }
  };

  const fetchTickets = async (filterParams, tags) => {
    try {
      const params = {
        queueIds: JSON.stringify(filterParams.queueIds),
        users: JSON.stringify(filterParams.users),
        status: JSON.stringify(filterParams.status),
        searchParam: filterParams.searchParam,
        hasTags: filterParams.hasTags
      };

      const requests = tags.map(tag => api.get("/ticket/kanban", {
        params: { ...params, tags: JSON.stringify([tag.id]) }
      }));

      requests.push(api.get("/ticket/kanban", {
        params: { ...params, hasTags: false }
      }));

      const response = await Promise.all(requests);

      const tickets = [];

      response.map(({ data }) => data.tickets).flat().forEach(ticket => {
        if (tickets.some(item => item.id === ticket.id)) {
          return;
        }
        tickets.push({ ...ticket });
      });

      setTickets(tickets);
    } catch (err) {
      console.log(err);
      //setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets(filterSettings, tags);
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate, tags, filterSettings]);

  // const handleSearchClick = () => {
  //   fetchTickets();
  // };

  // const handleStartDateChange = (event) => {
  //   setStartDate(event.target.value);
  // };

  // const handleEndDateChange = (event) => {
  //   setEndDate(event.target.value);
  // };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => {
      const hasNoQueues = ticket.tags.length === 0;

      if (user.allTicketsQueuesWaiting === "disable" && user.profile !== 'admin') {
        const userQueueIds = user.queues.map(queue => queue.id); // Obtém os IDs das filas do usuário
        return hasNoQueues && userQueueIds.includes(ticket.queueId); // Filtra apenas os tickets com queueId permitido
      }

      return hasNoQueues; // Se não estiver "disable", mantém todos os sem fila
    });

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: <>
            <div style={{ display: 'flex', justifyContent: 'end', gap: '5px' }}>
              <div className={classes.ticketLabel}>
                {i18n.t("kanban.cards.ticketNumber") + ticket.id.toString()}</div>
              <StatusIcon status={ticket.status} /></div></>,

          description: (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{ticket.contact.number}</span>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              <div style={{ textAlign: 'left' }}>{ticket.lastMessage || " "}</div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'start', gap: '5px' }}>
                {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
                <Button
                  className={`${classes.button} ${classes.cardButton}`}
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}>
                  {i18n.t("kanban.cards.viewTicket")}
                </Button>
              </div>
              <span style={{ marginRight: '8px' }} />

            </div>
          ),
          title: <>
            <div

              className={classes.cardName}

            >
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip> {ticket.contact.name}
            </div></>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.sort(
        (a, b) => a.sequence - b.sequence).map(tag => {
          const filteredTickets = tickets.filter(ticket => {
            const tagIds = ticket.tags.map(tag => tag.id);
            return tagIds.includes(tag.id);
          });

          return {
            id: tag.id.toString(),
            title: tag.name,
            label: filteredTickets?.length.toString(),
            cards: filteredTickets.map(ticket => ({
              id: ticket.id.toString(),
              label:
                <>
                  <div style={{ display: 'flex', justifyContent: 'end', gap: '5px' }}>
                    <div

                      className={classes.ticketLabel}>
                      {i18n.t("kanban.cards.ticketNumber") + ticket.id.toString()}</div>
                    <StatusIcon status={ticket.status} /></div></>,
              description: (
                <div>
                  <p>
                    {ticket.contact.number}
                    <br />
                    {ticket.lastMessage || " "}
                  </p>

                  <p>
                    {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
                  </p>

                  <span style={{ marginRight: '8px' }} />
                  <CardFooter onScheduleButton={handleOpenScheduleModal} ticket={ticket} >
                    <Button
                      className={`${classes.button} ${classes.cardButton}`}
                      size="small"
                      
                      onClick={() => {
                        handleCardClick(ticket.uuid)
                      }}>
                      {i18n.t("kanban.cards.viewTicket")}

                    </Button>
                    </CardFooter>
                </div>
              ),
              title: <>
                <div className={classes.cardName}>
                  <Tooltip title={ticket.whatsapp?.name}>
                    {IconChannel(ticket.channel)}
                  </Tooltip> {ticket.contact.name}
                </div> </>,
              draggable: true,
              href: "/tickets/" + ticket.uuid,
            })),
            style: { backgroundColor: tag.color, color: "white" }
          };
        }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(userQueueIds);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId, event) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success(i18n.t("kanban.notifications.tagRemoved"), {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success(i18n.t("kanban.notifications.tagAdded"), {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      //await fetchTickets(jsonString);
      const { data } = await api.get(`/tags/list`, { params: { kanban: 1 } });

      //popularCards(jsonString);

      await syncTags({ ticketId: targetLaneId, tags: data.filter(e => e.id === Number(sourceLaneId)) });
    } catch (err) {
      console.log(err);
    }
  };

  const syncTags = async (data) => {
    try {
      const { data: responseData } = await api.post(`/tags/syncLane`, data);
      return responseData;
    } catch (err) {
      toastError(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  const fetchUsers = async () => {
    try {
      if (!isAdmin) {
        return;
      }

      const response = await api.get("/users");
      setUsers(response.data.users || []);
      //setSelectedUsers((response.data.users || []).map(user => user.id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeUser = (selected) => {
    dispatch({
      type: 'SET_USERS',
      payload: selected
    });

    // Create temporary merged state for immediate fetch
    const updatedSettings = {
      ...filterSettings,
      users: selected
    };

    fetchTickets(updatedSettings, tags);
    setSelectedUsers(selected);
  }
  const handleChangeStatus = (selected) => {
    dispatch({
      type: 'SET_STATUS',
      payload: selected
    });

    // Create temporary merged state for immediate fetch
    const updatedSettings = {
      ...filterSettings,
      status: selected
    };

    fetchTickets(updatedSettings, tags);
    setSelectedStatus(selected);
  }
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();

    dispatch({
      type: 'SET_SEARCH_TERM',
      payload: searchValue
    });

    // Create temporary merged state for immediate fetch
    const updatedSettings = {
      ...filterSettings,
      searchParam: searchValue
    };

    fetchTickets(updatedSettings, tags);
    setSearchParam(searchValue);
  }



  return (
    <div className={classes.root}>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div
          className={classes.menu}
        >
          {isAdmin && (
            <>



              <FormControl
                size="small"
                style={{
                  minWidth: "20vh"
                }} variant="outlined">
                <InputLabel htmlFor="grouped-select">{i18n.t("kanban.user")}</InputLabel>
                <Select defaultValue=""
                  variant="outlined"
                  id="grouped-select"
                  label={i18n.t("kanban.user")}
                  minWidth={120}

                  value={selectedUsers}
                  onChange={(e) => handleChangeUser(e.target.value)}
                  multiple>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}

                </Select>
              </FormControl>






            </>)


          }

          <FormControl
            size="small"
            style={{
              minWidth: "20vh"
            }} variant="outlined">
            <InputLabel htmlFor="grouped-select">{i18n.t("kanban.status")}</InputLabel>
            <Select
              defaultValue=""
              variant="outlined"
              id="grouped-select"
              label={i18n.t("kanban.status")}
              minWidth={120}

              value={selectedStatus}
              onChange={(e) => handleChangeStatus(e.target.value)}
              multiple>
              {status.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.label}
                </MenuItem>
              ))}

            </Select>
          </FormControl>

          <FormControl

            size="small"
          >

            <TextField
              placeholder="search"
              type="search"
              size="small"
              variant="outlined"

              value={searchParam}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          {/* TODO: Ativar pesquisa por data*/}
          {/*  <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
          />

          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
          /> */}

          {/* <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
          >
            Buscar
          </Button> */}

          <Can role={user.profile} perform="dashboard:view" yes={() => (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddConnectionClick}
            >
              {i18n.t("kanban.cards.addColumns")}
            </Button>
          )} />
        </div>
      </div>
      <div className={classes.kanbanContainer}>
        {scheduleModalOpen && (
          <ScheduleModal
            open={scheduleModalOpen}
            isEditing={true}
            scheduleId={selectedSchedule}
            onClose={handleCloseScheduleModal}
            contactId={scheduleContactId}
            ticket={scheduleTicket}
            onSave={handleSaveScheduleModal}
            onDelete={handleDeleteScheduleModal}
          />
        )}

        {initialLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'column'
          }}>
            <CircularProgress size={60} />
            <Typography variant="h6" style={{ marginTop: 16 }}>
              {i18n.t("kanban.preLaoding")}
            </Typography>
          </div>
        ) : (
          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}

            style={{
              backgroundColor: 'rgba(252, 252, 252, 0.03)',
              height: "100%"
            }}
          />
        )}
      </div>
    </div>
  );

};

export default Kanban;
