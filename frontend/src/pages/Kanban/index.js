import React, { useState, useEffect, useContext } from "react";
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
import { Badge, Tooltip, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, useMediaQuery } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

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
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    color: theme.palette.common.white,
    justifyContent: "center",



  }
  ,
  kanbanContainer: {
    width: "100%",
    overflowY: "auto",
    overflowX: "auto",
    margin: "0 auto",
    position: "static",
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

  const [searchParam, setSearchParam] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState([{ id: 'pending', label: 'Pendente' }, { id: 'closed', label: 'Fechado' }, { id: 'open', label: 'Aberto' }]);
  const isAdmin = user.profile === "admin" || user.profile === "supervisor";
  const isSM = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags().then(() => {
      fetchTickets({
        queueIds: JSON.stringify(jsonString),
        users: JSON.stringify(user.id),
        status: JSON.stringify(status.map(item => item.id)),
        searchParam: searchParam
      }, tags);
    });
    fetchUsers();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];

      const userTagIds = user.tags.map(tag => tag.id);
      const filteredTags = fetchedTags.filter(tag => userTagIds.includes(tag.id));
      setTags(filteredTags);
      //fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async (params, tags) => {
    
    try {
      const requests = tags.map(tag => api.get("/ticket/kanban", { params: { ...params, tags: JSON.stringify([tag.id]) } }));
      requests.push(api.get("/ticket/kanban", { params: { ...params, hasTags: false } }));
      const response = await Promise.all(requests);

      const tickets = [];

      response.map(({ data }) => data.tickets).flat().forEach(ticket => {
        if (tickets.some(item => item.id === ticket.id)) {
          return;
        }
        tickets.push({...ticket});
      });

      setTickets(tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets({
          queueIds: JSON.stringify(jsonString),
          users: JSON.stringify(user.id),
          status: JSON.stringify(status.map(item => item.id)),
          searchParam: searchParam
        }, tags);
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

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
          label: "Ticket nº " + ticket.id.toString(),
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
              <Button
                className={`${classes.button} ${classes.cardButton}`}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </Button>
              <span style={{ marginRight: '8px' }} />
              {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
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
                  <div

                    className={classes.ticketLabel}>
                    {"Ticket nº " + ticket.id.toString()}
                  </div></>,
              description: (
                <div>
                  <p>
                    {ticket.contact.number}
                    <br />
                    {ticket.lastMessage || " "}
                  </p>
                  <Button
                    className={`${classes.button} ${classes.cardButton}`}
                    onClick={() => {
                      handleCardClick(ticket.uuid)
                    }}>
                    Ver Ticket
                  </Button>
                  <span style={{ marginRight: '8px' }} />
                  <p>
                    {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
                  </p>
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
    popularCards(jsonString);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId, event) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 2000,
      });
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!', {
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

    const params = {
      queueIds: JSON.stringify(jsonString),
      users: JSON.stringify(selected),
      status: JSON.stringify(status.map(item => item.id)),
      searchParam: searchParam
    };

    fetchTickets(params, tags);
    setSelectedUsers(selected);

  }
  const handleChangeStatus = (selected) => {
    const params = {
      queueIds: JSON.stringify(jsonString),
      users: JSON.stringify(users.map(item => item.id)),
      status: JSON.stringify(selected),
      searchParam: searchParam
    };

    fetchTickets(params, tags);
    setSelectedStatus(selected);
  }
  const handleSearch = (e) => {
    const params = {
      queueIds: JSON.stringify(jsonString),

      searchParam: e.target.value
    };

    setSearchParam(e.target.value.toLowerCase());
    fetchTickets(params, tags);

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
              {'+ Adicionar colunas'}
            </Button>
          )} />
        </div>
      </div>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}

          style={{
            backgroundColor: 'rgba(252, 252, 252, 0.03)',
            height: isSM ? '85vh' : '80vh',
          }}
        />
      </div>
    </div>
  );

};

export default Kanban;
